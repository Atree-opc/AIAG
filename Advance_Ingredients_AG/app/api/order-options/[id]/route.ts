import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'

// DELETE — remove option (admin only)
export const DELETE = withAuth(async (_req, _user, context) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM order_options WHERE option_id = $1',
      [context.params.id]
    )
    if (!rowCount) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin'])

// PATCH — update sort_order or value (admin only)
export const PATCH = withAuth(async (req, _user, context) => {
  try {
    const { value, sort_order } = await req.json()
    const { rows } = await pool.query(
      `UPDATE order_options SET
        value = COALESCE($1, value),
        sort_order = COALESCE($2, sort_order)
       WHERE option_id = $3 RETURNING *`,
      [value ?? null, sort_order ?? null, context.params.id]
    )
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin'])
