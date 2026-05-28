import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'
import { JWTPayload } from '@/types'

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

// GET — list orders filtered by role
export const GET = withAuth(async (_req, user: JWTPayload) => {
  try {
    let query: string
    let params: unknown[]

    if (user.role === 'admin') {
      query = 'SELECT * FROM orders ORDER BY created_at DESC'
      params = []
    } else if (user.role === 'staff') {
      query = `
        SELECT o.* FROM orders o
        JOIN order_visibility ov ON o.container_number = ov.container_number
        WHERE ov.role = 'staff'
        ORDER BY o.created_at DESC
      `
      params = []
    } else if (user.role === 'customer') {
      query = `
        SELECT o.* FROM orders o
        JOIN order_visibility ov ON o.container_number = ov.container_number
        WHERE ov.role = 'customer' AND o.customer_id = $1
        ORDER BY o.created_at DESC
      `
      params = [user.userId]
    } else if (user.role === 'accountant') {
      // Accountant sees all orders, read-only, field-filtered
      query = 'SELECT * FROM orders ORDER BY created_at DESC'
      params = []
    } else {
      query = `
        SELECT o.* FROM orders o
        JOIN order_visibility ov ON o.container_number = ov.container_number
        WHERE ov.role = 'supplier' AND o.supplier_id = $1
        ORDER BY o.created_at DESC
      `
      params = [user.userId]
    }

    const { rows } = await pool.query(query, params)

    // Apply field filtering for staff, customer, supplier, and accountant
    if (user.role === 'staff' || user.role === 'customer' || user.role === 'supplier' || user.role === 'accountant') {
      const allowed = await getAllowedFields(user.role)
      return NextResponse.json(rows.map(r => filterRow(r, allowed)))
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
