import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'
import { JWTPayload } from '@/types'
import { ensureChecklistForAllContainers, ensureChecklistForContainer } from '@/lib/file-checklist'

// Build a role-scoped field whitelist: visible fields minus hard-denied, always include container_number
async function getAllowedFields(role: string): Promise<string[]> {
  const [{ rows: visible }, { rows: denied }] = await Promise.all([
    pool.query('SELECT field_key FROM role_field_visibility WHERE role = $1', [role]),
    pool.query('SELECT field_key FROM hard_denied_info'),
  ])
  const deniedSet = new Set(denied.map((r: { field_key: string }) => r.field_key))
  const allowed = new Set(['container_number'])
  for (const { field_key } of visible) {
    if (!deniedSet.has(field_key)) allowed.add(field_key)
  }
  return Array.from(allowed)
}

function filterRow(row: Record<string, unknown>, allowed: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of allowed) if (key in row) out[key] = row[key]
  return out
}

const CHECKLIST_DERIVED_FIELDS = [
  'checklist_required_count',
  'checklist_uploaded_count',
  'checklist_reviewing_count',
  'checklist_approved_count',
  'checklist_rejected_count',
  'checklist_missing_count',
  'checklist_overall_status',
  'missing_required_categories',
] as const

function getScopedOrdersSql(user: JWTPayload): { sql: string; params: unknown[] } {
  if (user.role === 'admin' || user.role === 'accountant') {
    return {
      sql: 'SELECT o.* FROM orders o',
      params: [],
    }
  }

  if (user.role === 'staff') {
    return {
      sql: `
        SELECT o.* FROM orders o
        JOIN order_visibility ov ON o.container_number = ov.container_number
        WHERE ov.role = 'staff'
      `,
      params: [],
    }
  }

  if (user.role === 'customer') {
    return {
      sql: `
        SELECT o.* FROM orders o
        JOIN order_visibility ov ON o.container_number = ov.container_number
        WHERE ov.role = 'customer' AND o.customer_id = $1
      `,
      params: [user.userId],
    }
  }

  return {
    sql: `
      SELECT o.* FROM orders o
      JOIN order_visibility ov ON o.container_number = ov.container_number
      WHERE ov.role = 'supplier' AND o.supplier_id = $1
    `,
    params: [user.userId],
  }
}

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return parsed
}

function buildOrdersWithChecklistSql(scopedSql: string): string {
  return `
    WITH scoped_orders AS (${scopedSql}),
    checklist_summary AS (
      SELECT
        checklist.container_number,
        COUNT(*) FILTER (WHERE categories.required)::int AS checklist_required_count,
        COUNT(*) FILTER (WHERE checklist.status = 'uploaded')::int AS checklist_uploaded_count,
        COUNT(*) FILTER (WHERE checklist.status = 'reviewing')::int AS checklist_reviewing_count,
        COUNT(*) FILTER (WHERE checklist.status = 'approved' AND categories.required)::int AS checklist_approved_count,
        COUNT(*) FILTER (WHERE checklist.status = 'rejected')::int AS checklist_rejected_count,
        COUNT(*) FILTER (WHERE checklist.status = 'missing' AND categories.required)::int AS checklist_missing_count,
        ARRAY_REMOVE(
          ARRAY_AGG(
            CASE
              WHEN checklist.status = 'missing' AND categories.required THEN categories.label_zh
              ELSE NULL
            END
            ORDER BY categories.sort_order
          ),
          NULL
        ) AS missing_required_categories
      FROM order_file_checklist checklist
      JOIN order_file_categories categories ON checklist.category_code = categories.category_code
      GROUP BY checklist.container_number
    ),
    orders_with_checklist AS (
      SELECT
        scoped_orders.*,
        COALESCE(checklist_summary.checklist_required_count, 0) AS checklist_required_count,
        COALESCE(checklist_summary.checklist_uploaded_count, 0) AS checklist_uploaded_count,
        COALESCE(checklist_summary.checklist_reviewing_count, 0) AS checklist_reviewing_count,
        COALESCE(checklist_summary.checklist_approved_count, 0) AS checklist_approved_count,
        COALESCE(checklist_summary.checklist_rejected_count, 0) AS checklist_rejected_count,
        COALESCE(checklist_summary.checklist_missing_count, 0) AS checklist_missing_count,
        COALESCE(checklist_summary.missing_required_categories, ARRAY[]::text[]) AS missing_required_categories,
        CASE
          WHEN COALESCE(checklist_summary.checklist_missing_count, 0) > 0 THEN 'missing'
          WHEN COALESCE(checklist_summary.checklist_rejected_count, 0) > 0 THEN 'rejected'
          WHEN COALESCE(checklist_summary.checklist_reviewing_count, 0) > 0 THEN 'reviewing'
          WHEN COALESCE(checklist_summary.checklist_required_count, 0) > 0
            AND COALESCE(checklist_summary.checklist_approved_count, 0) = COALESCE(checklist_summary.checklist_required_count, 0)
            THEN 'approved'
          WHEN COALESCE(checklist_summary.checklist_uploaded_count, 0) > 0 THEN 'uploaded'
          ELSE 'missing'
        END AS checklist_overall_status
      FROM scoped_orders
      LEFT JOIN checklist_summary
        ON checklist_summary.container_number = scoped_orders.container_number
    )
    SELECT * FROM orders_with_checklist
  `
}

// GET — list orders filtered by role
export const GET = withAuth(async (req, user: JWTPayload) => {
  try {
    await ensureChecklistForAllContainers()

    const url = new URL(req.url)
    const summaryMode = url.searchParams.get('summary')
    const periodType = url.searchParams.get('periodType')
    const period = url.searchParams.get('period')
    const checklistStatus = url.searchParams.get('checklistStatus')
    const limit = parsePositiveInt(url.searchParams.get('limit'))
    const offset = parsePositiveInt(url.searchParams.get('offset')) ?? 0

    const { sql: scopedSql, params: baseParams } = getScopedOrdersSql(user)
    const ordersWithChecklistSql = buildOrdersWithChecklistSql(scopedSql)

    if (summaryMode === 'periods') {
      const [monthResult, quarterResult, totalsResult] = await Promise.all([
        pool.query(
          `
            SELECT
              belonged_month AS key,
              COUNT(*)::int AS count,
              COUNT(*) FILTER (WHERE checklist_missing_count > 0)::int AS missing_count
            FROM (${ordersWithChecklistSql}) scoped
            WHERE belonged_month IS NOT NULL
            GROUP BY belonged_month
          `,
          baseParams
        ),
        pool.query(
          `
            SELECT
              belonged_quarter AS key,
              COUNT(*)::int AS count,
              COUNT(*) FILTER (WHERE checklist_missing_count > 0)::int AS missing_count
            FROM (${ordersWithChecklistSql}) scoped
            WHERE belonged_quarter IS NOT NULL
            GROUP BY belonged_quarter
          `,
          baseParams
        ),
        pool.query(
          `
            SELECT
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE belonged_month IS NULL)::int AS unassigned_count,
              COUNT(*) FILTER (WHERE checklist_overall_status = 'missing')::int AS missing_orders_count,
              COUNT(*) FILTER (WHERE checklist_overall_status = 'reviewing')::int AS reviewing_orders_count,
              COUNT(*) FILTER (WHERE checklist_overall_status = 'rejected')::int AS rejected_orders_count,
              COUNT(*) FILTER (WHERE checklist_overall_status = 'approved')::int AS approved_orders_count,
              COUNT(*) FILTER (WHERE checklist_overall_status = 'uploaded')::int AS uploaded_orders_count
            FROM (${ordersWithChecklistSql}) scoped
          `,
          baseParams
        ),
      ])

      return NextResponse.json({
        total: totalsResult.rows[0]?.total ?? 0,
        unassignedCount: totalsResult.rows[0]?.unassigned_count ?? 0,
        missingOrdersCount: totalsResult.rows[0]?.missing_orders_count ?? 0,
        reviewingOrdersCount: totalsResult.rows[0]?.reviewing_orders_count ?? 0,
        rejectedOrdersCount: totalsResult.rows[0]?.rejected_orders_count ?? 0,
        approvedOrdersCount: totalsResult.rows[0]?.approved_orders_count ?? 0,
        uploadedOrdersCount: totalsResult.rows[0]?.uploaded_orders_count ?? 0,
        months: monthResult.rows,
        quarters: quarterResult.rows,
      })
    }

    const params = [...baseParams]
    const filterClauses: string[] = []

    if (periodType === 'month') {
      if (period === 'unassigned') {
        filterClauses.push('belonged_month IS NULL')
      } else if (period) {
        params.push(period)
        filterClauses.push(`belonged_month = $${params.length}`)
      }
    } else if (periodType === 'quarter') {
      if (period === 'unassigned') {
        filterClauses.push('belonged_quarter IS NULL')
      } else if (period) {
        params.push(period)
        filterClauses.push(`belonged_quarter = $${params.length}`)
      }
    }

    if (checklistStatus && checklistStatus !== 'all') {
      params.push(checklistStatus)
      filterClauses.push(`checklist_overall_status = $${params.length}`)
    }

    let query = `SELECT * FROM (${ordersWithChecklistSql}) scoped`
    if (filterClauses.length > 0) {
      query += ` WHERE ${filterClauses.join(' AND ')}`
    }
    query += ' ORDER BY created_at DESC'

    if (limit !== null) {
      params.push(limit)
      query += ` LIMIT $${params.length}`
      if (offset > 0) {
        params.push(offset)
        query += ` OFFSET $${params.length}`
      }
    }

    const { rows } = await pool.query(query, params)

    // Apply field filtering for staff, customer, supplier, and accountant
    if (user.role === 'staff' || user.role === 'customer' || user.role === 'supplier' || user.role === 'accountant') {
      const allowed = await getAllowedFields(user.role)
      const derivedAllowed = user.role === 'staff' ? [...CHECKLIST_DERIVED_FIELDS] : []
      return NextResponse.json(rows.map(r => filterRow(r, [...allowed, ...derivedAllowed])))
    }

    // Admin gets all fields
    return NextResponse.json(rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// POST — create order (admin/staff only)
export const POST = withAuth(async (req) => {
  try {
    const body = await req.json()
    const {
      contract_id, customer_id, supplier_id, container_number, bl, brand, product,
      price, quantity, quantity_unit, loading_date, etd, ship_on_board_date,
      eta, batch_no, production_date, df_invoice_no, df_ai_price,
      freight_forwarder, freight_forwarder_method, lc_number, port_of_loading, port_of_discharge,
      status, remarks, belonged_month, belonged_quarter,
      parity, packing, payment_terms, origin, shelf_life,
      invoice_no, lc_issue_date, lc_bank_name, lc_bank_bic, lc_bank_address,
      buyer_name, buyer_address,
      is_organic, tc_contract_no, tc_invoice_no, tc_seller, tc_buyer,
    } = body

    if (!container_number || String(container_number).trim() === '') {
      return NextResponse.json({ error: 'container_number is required' }, { status: 400 })
    }

    const safeCustomerId = customer_id && UUID_RE.test(customer_id) ? customer_id : null
    const safeSupplierId = supplier_id && UUID_RE.test(supplier_id) ? supplier_id : null
    const safeDate = (v: unknown) => (v && String(v).trim() !== '' ? v : null)

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const { rows } = await client.query(`
        INSERT INTO orders (
          container_number, contract_id, customer_id, supplier_id, bl, brand, product,
          price, quantity, quantity_unit, loading_date, etd, ship_on_board_date,
          eta, batch_no, production_date, df_invoice_no, df_ai_price,
          freight_forwarder, freight_forwarder_method, lc_number, port_of_loading, port_of_discharge,
          status, remarks, belonged_month, belonged_quarter,
          parity, packing, payment_terms, origin, shelf_life,
          invoice_no, lc_issue_date, lc_bank_name, lc_bank_bic, lc_bank_address,
          buyer_name, buyer_address,
          is_organic, tc_contract_no, tc_invoice_no, tc_seller, tc_buyer
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,
          $27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43
        ) RETURNING *
      `, [
        container_number, contract_id, safeCustomerId, safeSupplierId, bl, brand, product,
        price, quantity, quantity_unit ?? 'MT',
        safeDate(loading_date), safeDate(etd), safeDate(ship_on_board_date),
        safeDate(eta), batch_no, safeDate(production_date), df_invoice_no, df_ai_price,
        freight_forwarder, freight_forwarder_method || null, lc_number, port_of_loading, port_of_discharge,
        status ?? 'pending', remarks,
        belonged_month || null, belonged_quarter || null,
        parity || null, packing || null, payment_terms || null, origin || null, shelf_life || null,
        invoice_no || null, safeDate(lc_issue_date), lc_bank_name || null, lc_bank_bic || null, lc_bank_address || null,
        buyer_name || null, buyer_address || null,
        is_organic ?? false, tc_contract_no || null, tc_invoice_no || null, tc_seller || null, tc_buyer || null,
      ])

      const order = rows[0]

      // Default visibility: all non-admin roles
      await client.query(`
        INSERT INTO order_visibility (container_number, role) VALUES
        ($1, 'staff'), ($1, 'customer'), ($1, 'supplier')
      `, [order.container_number])

      await ensureChecklistForContainer(order.container_number, client)

      await client.query('COMMIT')
      return NextResponse.json(order, { status: 201 })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin', 'staff'])
