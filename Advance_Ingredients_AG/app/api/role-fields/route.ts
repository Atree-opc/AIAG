import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'
import { JWTPayload } from '@/types'

// GET /api/role-fields?role=customer
// Returns { role, fields: { field_key, editable }[] }
// admin can query any role, staff can query customer/supplier, others can only query themselves
export const GET = withAuth(async (req: Request, user: JWTPayload) => {
  const url = new URL(req.url)
  const queryRole = url.searchParams.get('role')

  let role: string
  if (user.role === 'admin' && queryRole) {
    // Admin can query any role
    role = queryRole
  } else if (user.role === 'staff' && queryRole && (queryRole === 'customer' || queryRole === 'supplier')) {
    // Staff can query customer and supplier roles
    role = queryRole
  } else {
    // Others can only query themselves
    role = user.role
  }

  // admin and staff now have configurable permissions from database
  try {
    const { rows } = await pool.query(
      `SELECT field_key, editable FROM role_field_visibility WHERE role = $1 ORDER BY field_key`,
      [role]
    )
    return NextResponse.json({ role, fields: rows })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PUT /api/role-fields
// Body: { role: string, fields: { field_key: string, editable: boolean }[] }
export const PUT = withAuth(async (req: Request, _user: JWTPayload) => {
  try {
    const { role, fields } = await req.json()
    if (!role || !Array.isArray(fields)) {
      return NextResponse.json({ error: 'role and fields[] required' }, { status: 400 })
    }

    const { rows: denied } = await pool.query('SELECT field_key FROM hard_denied_info')
    const deniedSet = new Set(denied.map((r: { field_key: string }) => r.field_key))
    const safeFields = fields.filter((f: { field_key: string }) => !deniedSet.has(f.field_key))

    await pool.query('BEGIN')
    await pool.query(`DELETE FROM role_field_visibility WHERE role = $1`, [role])
    if (safeFields.length > 0) {
      const values = safeFields.map((_: unknown, i: number) =>
        `($1, $${i * 2 + 2}, $${i * 2 + 3})`
      ).join(', ')
      const params: unknown[] = [role]
      for (const f of safeFields) params.push(f.field_key, f.editable ?? false)
      await pool.query(
        `INSERT INTO role_field_visibility (role, field_key, editable) VALUES ${values}`,
        params
      )
    }
    await pool.query('COMMIT')

    return NextResponse.json({ ok: true, role, fields })
  } catch (err) {
    await pool.query('ROLLBACK')
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin', 'staff'])
