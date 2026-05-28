import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'

// GET — list options (all authenticated users, for dropdowns)
export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const query = type
      ? 'SELECT * FROM order_options WHERE option_type = $1 ORDER BY sort_order, value'
      : 'SELECT * FROM order_options ORDER BY option_type, sort_order, value'
    const params = type ? [type] : []
    const { rows } = await pool.query(query, params)
    return NextResponse.json(rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST — add option (admin only)
export const POST = withAuth(async (req) => {
  try {
    const { option_type, value, sort_order } = await req.json()
    if (!option_type || !value) {
      return NextResponse.json({ error: 'option_type and value are required' }, { status: 400 })
    }
    const { rows } = await pool.query(
      `INSERT INTO order_options (option_type, value, sort_order)
       VALUES ($1, $2, $3) RETURNING *`,
      [option_type, value, sort_order ?? 0]
    )
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') {
      return NextResponse.json({ error: 'Option already exists' }, { status: 409 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin'])
