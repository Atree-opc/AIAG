import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'

const VALID_ROLES = ['staff', 'supplier', 'customer']

// GET — get visibility roles for an order (admin only)
export const GET = withAuth(async (_req, _user, context) => {
  try {
    const id = context.params.id
    const { rows } = await pool.query(
      'SELECT role FROM order_visibility WHERE container_number = $1',
      [id]
    )
    return NextResponse.json({ roles: rows.map(r => r.role) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin'])

// PUT — replace visibility roles (admin only)
export const PUT = withAuth(async (req, _user, context) => {
  try {
    const id = context.params.id
    const { roles }: { roles: string[] } = await req.json()

    const invalid = roles.filter(r => !VALID_ROLES.includes(r))
    if (invalid.length > 0) {
      return NextResponse.json({ error: `Invalid roles: ${invalid.join(', ')}` }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('DELETE FROM order_visibility WHERE container_number = $1', [id])
      for (const role of roles) {
        await client.query(
          'INSERT INTO order_visibility (container_number, role) VALUES ($1, $2)',
          [id, role]
        )
      }
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin'])
