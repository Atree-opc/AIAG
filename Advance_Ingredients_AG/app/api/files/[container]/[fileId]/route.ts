import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'
import { JWTPayload } from '@/types'
import { getFilePath, deleteFile } from '@/lib/file-storage'
import {
  applyCategoryVisibilityToFiles,
  ensureChecklistForContainer,
  getCategoryVisibilityDefaults,
  isValidFileChecklistStatus,
  normalizeFileCategoryCode,
  syncChecklistStatuses,
} from '@/lib/file-checklist'
import fs from 'fs'

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

// GET /api/files/[container]/[fileId] — download a file
export const GET = withAuth(async (_req, user: JWTPayload, context) => {
  const container = context?.params?.container as string
  const fileId = context?.params?.fileId as string

  if (!(await canAccessOrder(container, user))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await ensureChecklistForContainer(container)

    // Build visibility filter for non-admin/staff
    let visibilityFilter = ''
    if (user.role === 'supplier') visibilityFilter = 'AND f.visible_to_supplier = true'
    else if (user.role === 'customer') visibilityFilter = 'AND f.visible_to_customer = true'
    else if (user.role === 'accountant') visibilityFilter = 'AND f.visible_to_accountant = true'

    const { rows } = await pool.query(
      `SELECT f.*, om.year, om.month
       FROM order_files f
       LEFT JOIN order_month om ON f.container_number = om.container_number
       WHERE f.file_id=$1 AND f.container_number=$2 ${visibilityFilter}`,
      [fileId, container]
    )
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const file = rows[0]
    const filePath = getFilePath(file.year ?? null, file.month ?? null, container, file.stored_name)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }

    const buffer = fs.readFileSync(filePath)

    // Always use octet-stream regardless of stored MIME type.
    // This prevents client-spoofed MIME types from being reflected back,
    // and forces browsers to download rather than render the file.
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.filename)}"`,
        'Content-Length': String(buffer.length),
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// DELETE /api/files/[container]/[fileId] — delete a file (admin, staff only)
export const DELETE = withAuth(async (_req, user: JWTPayload, context) => {
  const container = context?.params?.container as string
  const fileId = context?.params?.fileId as string

  if (!(await canAccessOrder(container, user))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await ensureChecklistForContainer(container)

    const { rows } = await pool.query(
      `SELECT f.*, om.year, om.month
       FROM order_files f
       LEFT JOIN order_month om ON f.container_number = om.container_number
       WHERE f.file_id=$1 AND f.container_number=$2`,
      [fileId, container]
    )
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const file = rows[0]
    deleteFile(file.year ?? null, file.month ?? null, container, file.stored_name)

    await pool.query(`DELETE FROM order_files WHERE file_id=$1`, [fileId])
    await syncChecklistStatuses(container)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin', 'staff'])

// PATCH /api/files/[container]/[fileId] — rename or update visibility (admin, staff only)
export const PATCH = withAuth(async (req, user: JWTPayload, context) => {
  const container = context?.params?.container as string
  const fileId = context?.params?.fileId as string

  if (!(await canAccessOrder(container, user))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await ensureChecklistForContainer(container)

    const body = await req.json()
    const updates: string[] = []
    const values: unknown[] = []

    if (body.filename !== undefined) {
      const name = String(body.filename).trim()
      if (!name) return NextResponse.json({ error: 'filename cannot be empty' }, { status: 400 })
      updates.push(`filename=$${values.length + 1}`)
      values.push(name)
    }
    if (body.visible_to_customer !== undefined) {
      updates.push(`visible_to_customer=$${values.length + 1}`)
      values.push(Boolean(body.visible_to_customer))
    }
    if (body.visible_to_supplier !== undefined) {
      updates.push(`visible_to_supplier=$${values.length + 1}`)
      values.push(Boolean(body.visible_to_supplier))
    }
    if (body.visible_to_accountant !== undefined) {
      updates.push(`visible_to_accountant=$${values.length + 1}`)
      values.push(Boolean(body.visible_to_accountant))
    }
    let categoryVisibilityDefaults:
      | {
          visible_to_supplier: boolean
          visible_to_customer: boolean
          visible_to_accountant: boolean
        }
      | null = null

    if (body.category_code !== undefined) {
      const normalizedCategoryCode = normalizeFileCategoryCode(body.category_code)
      categoryVisibilityDefaults = await getCategoryVisibilityDefaults(normalizedCategoryCode)
      updates.push(`category_code=$${values.length + 1}`)
      values.push(normalizedCategoryCode)
      updates.push(`visible_to_supplier=$${values.length + 1}`)
      values.push(categoryVisibilityDefaults.visible_to_supplier)
      updates.push(`visible_to_customer=$${values.length + 1}`)
      values.push(categoryVisibilityDefaults.visible_to_customer)
      updates.push(`visible_to_accountant=$${values.length + 1}`)
      values.push(categoryVisibilityDefaults.visible_to_accountant)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    values.push(fileId, container)
    const { rows } = await pool.query(
      `UPDATE order_files SET ${updates.join(', ')}
       WHERE file_id=$${values.length - 1} AND container_number=$${values.length}
       RETURNING *`,
      values
    )
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await syncChecklistStatuses(container)
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin', 'staff'])

// POST /api/files/[container]/[fileId] — update checklist item status or note (admin, staff only)
export const POST = withAuth(async (req, user: JWTPayload, context) => {
  const container = context?.params?.container as string
  const fileId = context?.params?.fileId as string

  if (fileId !== '__checklist__') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (!(await canAccessOrder(container, user))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await ensureChecklistForContainer(container)

    const body = await req.json()
    const categoryCode = normalizeFileCategoryCode(body.category_code)
    const checklistUpdates: string[] = []
    const checklistValues: unknown[] = []

    if (body.status !== undefined) {
      if (!isValidFileChecklistStatus(body.status)) {
        return NextResponse.json({ error: 'Invalid checklist status' }, { status: 400 })
      }
      checklistUpdates.push(`status=$${checklistValues.length + 1}`)
      checklistValues.push(body.status)
    }

    if (body.note !== undefined) {
      checklistUpdates.push(`note=$${checklistValues.length + 1}`)
      checklistValues.push(body.note ? String(body.note).trim() : null)
    }

    const hasVisibilityUpdate =
      body.visible_to_supplier !== undefined
      || body.visible_to_customer !== undefined
      || body.visible_to_accountant !== undefined

    if (checklistUpdates.length === 0 && !hasVisibilityUpdate) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    let checklistRow: Record<string, unknown> | null = null
    if (checklistUpdates.length > 0) {
      checklistUpdates.push(`updated_by=$${checklistValues.length + 1}`)
      checklistValues.push(user.userId)
      checklistUpdates.push(`updated_at=NOW()`)

      checklistValues.push(container, categoryCode)

      const { rows } = await pool.query(
        `UPDATE order_file_checklist
         SET ${checklistUpdates.join(', ')}
         WHERE container_number=$${checklistValues.length - 1} AND category_code=$${checklistValues.length}
         RETURNING *`,
        checklistValues
      )

      if (rows.length === 0) {
        return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 })
      }

      checklistRow = rows[0]
    }

    let categoryVisibility = await getCategoryVisibilityDefaults(categoryCode)
    if (hasVisibilityUpdate) {
      const visibilityPayload = {
        visible_to_supplier:
          body.visible_to_supplier !== undefined ? Boolean(body.visible_to_supplier) : categoryVisibility.visible_to_supplier,
        visible_to_customer:
          body.visible_to_customer !== undefined ? Boolean(body.visible_to_customer) : categoryVisibility.visible_to_customer,
        visible_to_accountant:
          body.visible_to_accountant !== undefined ? Boolean(body.visible_to_accountant) : categoryVisibility.visible_to_accountant,
      }

      const { rows } = await pool.query(
        `
          UPDATE order_file_categories
          SET
            visible_to_supplier = $1,
            visible_to_customer = $2,
            visible_to_accountant = $3
          WHERE category_code = $4
          RETURNING visible_to_supplier, visible_to_customer, visible_to_accountant
        `,
        [
          visibilityPayload.visible_to_supplier,
          visibilityPayload.visible_to_customer,
          visibilityPayload.visible_to_accountant,
          categoryCode,
        ]
      )

      if (rows.length === 0) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }

      categoryVisibility = {
        visible_to_supplier: rows[0].visible_to_supplier,
        visible_to_customer: rows[0].visible_to_customer,
        visible_to_accountant: rows[0].visible_to_accountant,
      }

      await applyCategoryVisibilityToFiles(categoryCode, categoryVisibility)
    }

    return NextResponse.json({
      ...(checklistRow ?? {}),
      ...categoryVisibility,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin', 'staff'])
