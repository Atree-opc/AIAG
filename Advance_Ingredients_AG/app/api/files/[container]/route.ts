import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'
import { JWTPayload } from '@/types'
import {
  ensureOrderDir, generateStoredName, getFilePath,
  ALLOWED_MIME_TYPES, MAX_FILE_SIZE,
} from '@/lib/file-storage'
import fs from 'fs'

// Per-user upload rate limit: max 20 uploads per hour
const uploadAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_UPLOADS_PER_HOUR = 20
const UPLOAD_WINDOW_MS = 60 * 60 * 1000

function checkUploadLimit(userId: string): boolean {
  const now = Date.now()
  const entry = uploadAttempts.get(userId)
  if (!entry || now > entry.resetAt) {
    uploadAttempts.set(userId, { count: 1, resetAt: now + UPLOAD_WINDOW_MS })
    return true // allowed
  }
  if (entry.count >= MAX_UPLOADS_PER_HOUR) return false // blocked
  entry.count += 1
  return true
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
    let visibilityFilter = ''
    if (user.role === 'supplier') {
      visibilityFilter = 'AND f.visible_to_supplier = true'
    } else if (user.role === 'customer') {
      visibilityFilter = 'AND f.visible_to_customer = true'
    } else if (user.role === 'accountant') {
      visibilityFilter = 'AND f.visible_to_accountant = true'
    }
    // admin and staff see all files (no filter)

    const { rows } = await pool.query(
      `SELECT f.*, u.name AS uploaded_by_name
       FROM order_files f
       LEFT JOIN users u ON f.uploaded_by = u.user_id
       WHERE f.container_number = $1 ${visibilityFilter}
       ORDER BY f.uploaded_at DESC`,
      [container]
    )
    return NextResponse.json(rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST /api/files/[container] — upload a file
export const POST = withAuth(async (req, user: JWTPayload, context) => {
  const container = context?.params?.container as string
  if (!container) return NextResponse.json({ error: 'Missing container' }, { status: 400 })

  if (!(await canAccessOrder(container, user))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!checkUploadLimit(user.userId)) {
    return NextResponse.json(
      { error: 'Upload limit reached. Max 20 uploads per hour. / 上传次数超限，每小时最多上传20个文件。' },
      { status: 429 }
    )
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
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 50MB limit' }, { status: 400 })
    }

    const storedName = generateStoredName(file.name)
    ensureOrderDir(year, month, container)
    const filePath = getFilePath(year, month, container, storedName)

    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, buffer)

    // Supplier uploads are visible to supplier (and admin/staff) by default
    const visibleToSupplier = user.role === 'supplier'

    const { rows } = await pool.query(
      `INSERT INTO order_files
         (container_number, filename, stored_name, file_size, mime_type, uploaded_by, visible_to_supplier, visible_to_customer)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING *`,
      [container, file.name, storedName, file.size, file.type, user.userId, visibleToSupplier]
    )

    return NextResponse.json(rows[0], { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin', 'staff', 'supplier'])
