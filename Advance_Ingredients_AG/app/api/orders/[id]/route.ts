import { NextResponse } from 'next/server'
import fs from 'fs'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'
import { JWTPayload } from '@/types'
import { deleteFile, getOrderDir } from '@/lib/file-storage'

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

// GET — single order (visibility checked)
export const GET = withAuth(async (_req, user: JWTPayload, context) => {
  try {
    const id = context.params.id
    let query: string
    let params: unknown[]

    if (user.role === 'admin' || user.role === 'accountant') {
      query = 'SELECT * FROM orders WHERE container_number = $1'
      params = [id]
    } else if (user.role === 'customer') {
      query = `
        SELECT o.* FROM orders o
        JOIN order_visibility ov ON o.container_number = ov.container_number
        WHERE o.container_number = $1 AND ov.role = 'customer' AND o.customer_id = $2
      `
      params = [id, user.userId]
    } else {
      query = `
        SELECT o.* FROM orders o
        JOIN order_visibility ov ON o.container_number = ov.container_number
        WHERE o.container_number = $1 AND ov.role = $2
      `
      params = [id, user.role]
    }

    const { rows } = await pool.query(query, params)
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Apply field filtering for staff, customer, supplier, and accountant
    if (user.role === 'staff' || user.role === 'customer' || user.role === 'supplier' || user.role === 'accountant') {
      const allowed = await getAllowedFields(user.role)
      return NextResponse.json(filterRow(rows[0], allowed))
    }

    // Admin gets all fields
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PATCH — admin/staff: full access; customer/supplier: only their editable fields
export const PATCH = withAuth(async (req, user, context) => {
  try {
    const id = context.params.id
    const body = await req.json()

    const adminAllowed = [
      'contract_id','customer_id','supplier_id','bl','brand','product',
      'price','quantity','quantity_unit','loading_date','etd','ship_on_board_date',
      'eta','batch_no','production_date','df_invoice_no','df_ai_price',
      'freight_forwarder','freight_forwarder_method','lc_number','port_of_loading','port_of_discharge',
      'status','remarks','belonged_month','belonged_quarter',
      'parity','packing','payment_terms','origin','shelf_life',
      'invoice_no','lc_issue_date','lc_bank_name','lc_bank_bic','lc_bank_address',
      'buyer_name','buyer_address',
      'is_organic','tc_contract_no','tc_invoice_no','tc_seller','tc_buyer',
    ]

    let allowed: string[]
    if (user.role === 'admin') {
      // Admin can edit all fields
      allowed = adminAllowed
    } else if (user.role === 'staff') {
      // Staff editable fields from database
      const { rows: permRows } = await pool.query(
        `SELECT field_key FROM role_field_visibility WHERE role = $1 AND editable = true`,
        ['staff']
      )
      allowed = permRows.map(r => r.field_key)
      if (allowed.length === 0) {
        return NextResponse.json({ error: 'No editable fields configured for staff role' }, { status: 403 })
      }
    } else {
      // Customer and supplier: fetch editable fields for this role from DB
      const { rows: permRows } = await pool.query(
        `SELECT field_key FROM role_field_visibility WHERE role = $1 AND editable = true`,
        [user.role]
      )
      allowed = permRows.map(r => r.field_key)
      if (allowed.length === 0) {
        return NextResponse.json({ error: 'No editable fields for your role' }, { status: 403 })
      }
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if ('customer_id' in body) {
      body.customer_id = body.customer_id && UUID_RE.test(body.customer_id) ? body.customer_id : null
    }
    const DATE_FIELDS = ['loading_date','etd','ship_on_board_date','eta','production_date','lc_issue_date']
    for (const f of DATE_FIELDS) {
      if (f in body && (!body[f] || String(body[f]).trim() === '')) body[f] = null
    }

    const fields = Object.keys(body).filter(k => allowed.includes(k))
    if (fields.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const setClauses = fields.map((f, i) => `${f} = $${i + 1}`).join(', ')
    const values = fields.map(f => body[f])
    values.push(id)

    const { rows } = await pool.query(
      `UPDATE orders SET ${setClauses} WHERE container_number = $${values.length} RETURNING *`,
      values
    )
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// DELETE — admin and staff
export const DELETE = withAuth(async (_req, _user, context) => {
  try {
    const id = context.params.id

    // Fetch period + stored file names before cascade-deleting DB records
    const { rows: files } = await pool.query(
      `SELECT f.stored_name, om.year, om.month
       FROM order_files f
       LEFT JOIN order_month om ON f.container_number = om.container_number
       WHERE f.container_number = $1`,
      [id]
    )
    const { rows: periodRows } = await pool.query(
      `SELECT om.year, om.month FROM orders o
       LEFT JOIN order_month om ON o.container_number = om.container_number
       WHERE o.container_number = $1`,
      [id]
    )
    const period = periodRows[0]

    const { rowCount } = await pool.query(
      'DELETE FROM orders WHERE container_number = $1',
      [id]
    )
    if (!rowCount) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Remove individual files from disk
    for (const f of files) {
      try { deleteFile(f.year ?? null, f.month ?? null, id, f.stored_name) } catch { /* ignore missing */ }
    }
    // Remove the now-empty order directory
    try { fs.rmdirSync(getOrderDir(period?.year ?? null, period?.month ?? null, id)) } catch { /* ignore if not empty or missing */ }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin', 'staff'])
