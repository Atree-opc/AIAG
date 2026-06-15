import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'
import { JWTPayload } from '@/types'
import {
  ensureOrderDir, generateStoredName, getFilePath,
  ALLOWED_MIME_TYPES, MAX_FILE_SIZE,
} from '@/lib/file-storage'
import {
  ensureChecklistForContainer,
  normalizeFileCategoryCode,
} from '@/lib/file-checklist'
import fs from 'fs'

function extractFiles(formData: FormData): File[] {
  const values = [...formData.getAll('files'), ...formData.getAll('file')]
  return values.filter((value): value is File => value instanceof File && value.size > 0)
}

function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return 'File type not allowed'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File exceeds 50MB limit'
  }
  return null
}

async function canAccessOrder(containerNumber: string, user: JWTPayload): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'accountant') return true
  if (user.role === 'staff') {
    const { rows } = await pool.query(
      `SELECT 1 FROM order_visibility WHERE container_number=$1 AND role='staff'`,
      [containerNumber]
    )
    return rows.length > 0
  }
  if (user.role === 'supplier') {
    const { rows } = await pool.query(
      `SELECT 1 FROM orders o
       JOIN order_visibility ov ON o.container_number=ov.container_number
       WHERE o.container_number=$1 AND ov.role='supplier' AND o.supplier_id=$2`,
      [containerNumber, user.userId]
    )
    return rows.length > 0
  }
  if (user.role === 'customer') {
    const { rows } = await pool.query(
      `SELECT 1 FROM orders o
       JOIN order_visibility ov ON o.container_number=ov.container_number
       WHERE o.container_number=$1 AND ov.role='customer' AND o.customer_id=$2`,
      [containerNumber, user.userId]
    )
    return rows.length > 0
  }
  return false
}

// GET /api/files/[container] — list files, filtered by role visibility
export const GET = withAuth(async (_req, user: JWTPayload, context) => {
  const container = context?.params?.container as string
  if (!container) return NextResponse.json({ error: 'Missing container' }, { status: 400 })

  if (!(await canAccessOrder(container, user))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await ensureChecklistForContainer(container)

    let visibilityFilter = ''
    if (user.role === 'supplier') {
      visibilityFilter = 'AND f.visible_to_supplier = true'
    } else if (user.role === 'customer') {
      visibilityFilter = 'AND f.visible_to_customer = true'
    } else if (user.role === 'accountant') {
      visibilityFilter = 'AND f.visible_to_accountant = true'
    }
    // admin and staff see all files (no filter)

    const fileQuery = pool.query(
        `SELECT f.*, u.name AS uploaded_by_name, c.label_en AS category_label_en, c.label_zh AS category_label_zh
       FROM order_files f
       LEFT JOIN users u ON f.uploaded_by = u.user_id
       LEFT JOIN order_file_categories c ON f.category_code = c.category_code
       WHERE f.container_number = $1 ${visibilityFilter}
       ORDER BY COALESCE(c.sort_order, 999), f.uploaded_at DESC`,
        [container]
      )

    const checklistQuery = (user.role === 'admin' || user.role === 'staff')
      ? pool.query(
          `SELECT
           checklist.container_number,
           checklist.category_code,
           categories.label_en,
           categories.label_zh,
           categories.sort_order,
           categories.required,
           checklist.status,
           checklist.note,
           checklist.updated_by::text,
           checklist.updated_at,
           COUNT(files.file_id)::int AS file_count
         FROM order_file_checklist checklist
         JOIN order_file_categories categories ON checklist.category_code = categories.category_code
         LEFT JOIN order_files files
           ON files.container_number = checklist.container_number
          AND files.category_code = checklist.category_code
         WHERE checklist.container_number = $1
         GROUP BY
           checklist.container_number,
           checklist.category_code,
           categories.label_en,
           categories.label_zh,
           categories.sort_order,
           categories.required,
           checklist.status,
           checklist.note,
           checklist.updated_by,
           checklist.updated_at
         ORDER BY categories.sort_order, categories.label_en`,
          [container]
        )
      : Promise.resolve({ rows: [] as unknown[] })

    const [filesResult, checklistResult] = await Promise.all([fileQuery, checklistQuery])
    return NextResponse.json({
      files: filesResult.rows,
      checklist: checklistResult.rows,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST /api/files/[container] — upload one or more files
export const POST = withAuth(async (req, user: JWTPayload, context) => {
  const container = context?.params?.container as string
  if (!container) return NextResponse.json({ error: 'Missing container' }, { status: 400 })

  if (!(await canAccessOrder(container, user))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Look up the order's period for directory structure
    const { rows: periodRows } = await pool.query(
      `SELECT om.year, om.month
       FROM orders o
       LEFT JOIN order_month om ON o.container_number = om.container_number
       WHERE o.container_number = $1`,
      [container]
    )
    if (!periodRows[0]) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    const year: number | null = periodRows[0].year ?? null
    const month: number | null = periodRows[0].month ?? null

    const formData = await req.formData()
    const files = extractFiles(formData)
    if (files.length === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const invalidFile = files.find(file => validateFile(file))
    if (invalidFile) {
      return NextResponse.json(
        { error: `${invalidFile.name}: ${validateFile(invalidFile)}` },
        { status: 400 }
      )
    }

    ensureOrderDir(year, month, container)

    // Supplier uploads are visible to supplier (and admin/staff) by default
    const visibleToSupplier = user.role === 'supplier'
    const uploaded: unknown[] = []
    const failed: Array<{ filename: string; error: string }> = []

    for (const file of files) {
      const storedName = generateStoredName(file.name)
      const filePath = getFilePath(year, month, container, storedName)
      const categoryCode = normalizeFileCategoryCode(formData.get(`category:${file.name}`) ?? formData.get('category_code'))

      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        fs.writeFileSync(filePath, buffer)

        const { rows } = await pool.query(
          `INSERT INTO order_files
             (container_number, filename, stored_name, file_size, mime_type, uploaded_by, category_code, visible_to_supplier, visible_to_customer)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false) RETURNING *`,
          [container, file.name, storedName, file.size, file.type, user.userId, categoryCode, visibleToSupplier]
        )

        uploaded.push(rows[0])
      } catch (error) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
        console.error(error)
        failed.push({ filename: file.name, error: 'Upload failed' })
      }
    }

    await ensureChecklistForContainer(container, pool, user.userId)

    if (uploaded.length === 0) {
      return NextResponse.json(
        {
          error: failed[0]?.error ?? 'Upload failed',
          uploaded: [],
          failed,
          total: files.length,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        uploaded,
        failed,
        total: files.length,
      },
      { status: failed.length > 0 ? 207 : 201 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin', 'staff', 'supplier'])
