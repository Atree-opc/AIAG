import type { PoolClient } from 'pg'
import pool from '@/lib/db'
import { FILE_CATEGORY_TEMPLATES, FILE_CHECKLIST_STATUSES } from '@/lib/file-checklist-config'

type Queryable = Pick<PoolClient, 'query'> | typeof pool
export type CategoryVisibilityDefaults = {
  visible_to_supplier: boolean
  visible_to_customer: boolean
  visible_to_accountant: boolean
}

const FILE_CATEGORY_CODES = new Set<string>(FILE_CATEGORY_TEMPLATES.map(category => category.code))
const FILE_CHECKLIST_STATUS_SET = new Set<string>(FILE_CHECKLIST_STATUSES)

let schemaReady: Promise<void> | null = null

export function isValidFileCategoryCode(value: unknown): value is string {
  return typeof value === 'string' && FILE_CATEGORY_CODES.has(value)
}

export function isValidFileChecklistStatus(value: unknown): value is string {
  return typeof value === 'string' && FILE_CHECKLIST_STATUS_SET.has(value)
}

export function normalizeFileCategoryCode(value: unknown): string {
  return isValidFileCategoryCode(value) ? value : 'uncategorized'
}

async function ensureFileChecklistSchemaInternal(queryable: Queryable): Promise<void> {
  await queryable.query(`
    CREATE TABLE IF NOT EXISTS order_file_categories (
      category_code   VARCHAR(50) PRIMARY KEY,
      label_en        VARCHAR(100) NOT NULL,
      label_zh        VARCHAR(100) NOT NULL,
      sort_order      INT NOT NULL DEFAULT 0,
      required        BOOLEAN NOT NULL DEFAULT true,
      visible_to_supplier   BOOLEAN,
      visible_to_customer   BOOLEAN,
      visible_to_accountant BOOLEAN,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await queryable.query(`
    CREATE TABLE IF NOT EXISTS order_file_checklist (
      container_number VARCHAR(50) NOT NULL REFERENCES orders(container_number) ON DELETE CASCADE,
      category_code    VARCHAR(50) NOT NULL,
      status           VARCHAR(20) NOT NULL DEFAULT 'missing'
                       CHECK (status IN ('missing', 'uploaded', 'reviewing', 'approved', 'rejected')),
      note             TEXT,
      updated_by       UUID REFERENCES users(user_id),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (container_number, category_code)
    )
  `)

  await queryable.query(`
    ALTER TABLE order_file_categories
    ADD COLUMN IF NOT EXISTS visible_to_supplier BOOLEAN
  `)

  await queryable.query(`
    ALTER TABLE order_file_categories
    ADD COLUMN IF NOT EXISTS visible_to_customer BOOLEAN
  `)

  await queryable.query(`
    ALTER TABLE order_file_categories
    ADD COLUMN IF NOT EXISTS visible_to_accountant BOOLEAN
  `)

  await queryable.query(`
    WITH category_visibility AS (
      SELECT
        category_code,
        BOOL_OR(visible_to_supplier) AS visible_to_supplier,
        BOOL_OR(visible_to_customer) AS visible_to_customer,
        BOOL_OR(visible_to_accountant) AS visible_to_accountant
      FROM order_files
      GROUP BY category_code
    )
    UPDATE order_file_categories categories
    SET
      visible_to_supplier = COALESCE(categories.visible_to_supplier, category_visibility.visible_to_supplier, false),
      visible_to_customer = COALESCE(categories.visible_to_customer, category_visibility.visible_to_customer, false),
      visible_to_accountant = COALESCE(categories.visible_to_accountant, category_visibility.visible_to_accountant, false)
    FROM category_visibility
    WHERE categories.category_code = category_visibility.category_code
      AND (
        categories.visible_to_supplier IS NULL
        OR categories.visible_to_customer IS NULL
        OR categories.visible_to_accountant IS NULL
      )
  `)

  await queryable.query(`
    UPDATE order_file_categories
    SET
      visible_to_supplier = COALESCE(visible_to_supplier, false),
      visible_to_customer = COALESCE(visible_to_customer, false),
      visible_to_accountant = COALESCE(visible_to_accountant, false)
    WHERE
      visible_to_supplier IS NULL
      OR visible_to_customer IS NULL
      OR visible_to_accountant IS NULL
  `)

  await queryable.query(`
    ALTER TABLE order_file_categories
    ALTER COLUMN visible_to_supplier SET DEFAULT false
  `)

  await queryable.query(`
    ALTER TABLE order_file_categories
    ALTER COLUMN visible_to_customer SET DEFAULT false
  `)

  await queryable.query(`
    ALTER TABLE order_file_categories
    ALTER COLUMN visible_to_accountant SET DEFAULT false
  `)

  await queryable.query(`
    ALTER TABLE order_file_categories
    ALTER COLUMN visible_to_supplier SET NOT NULL
  `)

  await queryable.query(`
    ALTER TABLE order_file_categories
    ALTER COLUMN visible_to_customer SET NOT NULL
  `)

  await queryable.query(`
    ALTER TABLE order_file_categories
    ALTER COLUMN visible_to_accountant SET NOT NULL
  `)

  await queryable.query(`
    ALTER TABLE order_files
    ADD COLUMN IF NOT EXISTS category_code VARCHAR(50) NOT NULL DEFAULT 'uncategorized'
  `)

  await queryable.query(`
    UPDATE order_files
    SET category_code = 'uncategorized'
    WHERE category_code IS NULL OR category_code = ''
  `)

  await queryable.query(`
    CREATE INDEX IF NOT EXISTS idx_order_files_container_category
    ON order_files(container_number, category_code)
  `)

  await queryable.query(`
    CREATE INDEX IF NOT EXISTS idx_order_file_checklist_container_category
    ON order_file_checklist(container_number, category_code)
  `)

  const valuesSql = FILE_CATEGORY_TEMPLATES.map((_, index) => {
    const offset = index * 5
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`
  }).join(', ')

  const params = FILE_CATEGORY_TEMPLATES.flatMap(category => [
    category.code,
    category.label_en,
    category.label_zh,
    category.sort_order,
    category.required,
  ])

  await queryable.query(
    `
      INSERT INTO order_file_categories (category_code, label_en, label_zh, sort_order, required)
      VALUES ${valuesSql}
      ON CONFLICT (category_code) DO UPDATE SET
        label_en = EXCLUDED.label_en,
        label_zh = EXCLUDED.label_zh,
        sort_order = EXCLUDED.sort_order,
        required = EXCLUDED.required
    `,
    params
  )
}

export async function ensureFileChecklistSchema(queryable: Queryable = pool): Promise<void> {
  if (queryable === pool) {
    if (!schemaReady) {
      schemaReady = ensureFileChecklistSchemaInternal(queryable)
    }
    return schemaReady
  }

  await ensureFileChecklistSchemaInternal(queryable)
}

export async function ensureChecklistForContainer(
  containerNumber: string,
  queryable: Queryable = pool,
  updatedBy: string | null = null
): Promise<void> {
  await ensureFileChecklistSchema(queryable)

  await queryable.query(
    `
      INSERT INTO order_file_checklist (container_number, category_code, status, updated_by)
      SELECT
        $1,
        category_code,
        'missing',
        $2
      FROM order_file_categories
      ON CONFLICT (container_number, category_code) DO NOTHING
    `,
    [containerNumber, updatedBy]
  )

  await syncChecklistStatuses(containerNumber, queryable)
}

export async function getCategoryVisibilityDefaults(
  categoryCode: string,
  queryable: Queryable = pool
): Promise<CategoryVisibilityDefaults> {
  await ensureFileChecklistSchema(queryable)

  const normalizedCategoryCode = normalizeFileCategoryCode(categoryCode)
  const { rows } = await queryable.query(
    `
      SELECT
        visible_to_supplier,
        visible_to_customer,
        visible_to_accountant
      FROM order_file_categories
      WHERE category_code = $1
    `,
    [normalizedCategoryCode]
  )

  if (rows.length === 0) {
    return {
      visible_to_supplier: false,
      visible_to_customer: false,
      visible_to_accountant: false,
    }
  }

  return {
    visible_to_supplier: Boolean(rows[0].visible_to_supplier),
    visible_to_customer: Boolean(rows[0].visible_to_customer),
    visible_to_accountant: Boolean(rows[0].visible_to_accountant),
  }
}

export async function applyCategoryVisibilityToFiles(
  categoryCode: string,
  visibility: CategoryVisibilityDefaults,
  queryable: Queryable = pool
): Promise<void> {
  await ensureFileChecklistSchema(queryable)

  await queryable.query(
    `
      UPDATE order_files
      SET
        visible_to_supplier = $2,
        visible_to_customer = $3,
        visible_to_accountant = $4
      WHERE category_code = $1
    `,
    [
      normalizeFileCategoryCode(categoryCode),
      visibility.visible_to_supplier,
      visibility.visible_to_customer,
      visibility.visible_to_accountant,
    ]
  )
}

export async function ensureChecklistForAllContainers(queryable: Queryable = pool): Promise<void> {
  await ensureFileChecklistSchema(queryable)

  await queryable.query(
    `
      INSERT INTO order_file_checklist (container_number, category_code, status)
      SELECT
        orders.container_number,
        categories.category_code,
        'missing'
      FROM orders
      CROSS JOIN order_file_categories categories
      ON CONFLICT (container_number, category_code) DO NOTHING
    `
  )

  await queryable.query(
    `
      WITH category_counts AS (
        SELECT container_number, category_code, COUNT(*)::int AS file_count
        FROM order_files
        GROUP BY container_number, category_code
      ),
      resolved AS (
        SELECT
          checklist.container_number,
          checklist.category_code,
          COALESCE(category_counts.file_count, 0) AS file_count
        FROM order_file_checklist checklist
        LEFT JOIN category_counts
          ON category_counts.container_number = checklist.container_number
         AND category_counts.category_code = checklist.category_code
      )
      UPDATE order_file_checklist checklist
      SET
        status = CASE
          WHEN resolved.file_count = 0 THEN 'missing'
          WHEN checklist.status = 'missing' THEN 'uploaded'
          ELSE checklist.status
        END,
        updated_at = CASE
          WHEN resolved.file_count = 0 AND checklist.status <> 'missing' THEN NOW()
          WHEN resolved.file_count > 0 AND checklist.status = 'missing' THEN NOW()
          ELSE checklist.updated_at
        END
      FROM resolved
      WHERE checklist.container_number = resolved.container_number
        AND checklist.category_code = resolved.category_code
    `
  )
}

export async function syncChecklistStatuses(containerNumber: string, queryable: Queryable = pool): Promise<void> {
  await ensureFileChecklistSchema(queryable)

  await queryable.query(
    `
      WITH category_counts AS (
        SELECT category_code, COUNT(*)::int AS file_count
        FROM order_files
        WHERE container_number = $1
        GROUP BY category_code
      )
      UPDATE order_file_checklist checklist
      SET
        status = CASE
          WHEN COALESCE(category_counts.file_count, 0) = 0 THEN 'missing'
          WHEN checklist.status = 'missing' THEN 'uploaded'
          ELSE checklist.status
        END,
        updated_at = CASE
          WHEN COALESCE(category_counts.file_count, 0) = 0 AND checklist.status <> 'missing' THEN NOW()
          WHEN COALESCE(category_counts.file_count, 0) > 0 AND checklist.status = 'missing' THEN NOW()
          ELSE checklist.updated_at
        END
      FROM order_file_categories categories
      LEFT JOIN category_counts ON category_counts.category_code = categories.category_code
      WHERE checklist.container_number = $1
        AND checklist.category_code = categories.category_code
    `,
    [containerNumber]
  )
}
