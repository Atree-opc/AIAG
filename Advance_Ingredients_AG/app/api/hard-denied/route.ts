import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'

export const GET = withAuth(async () => {
  const { rows } = await pool.query('SELECT field_key FROM hard_denied_info ORDER BY field_key')
  return NextResponse.json({ fields: rows.map(r => r.field_key) })
})

export const PUT = withAuth(async (req) => {
  const { fields } = await req.json()
  if (!Array.isArray(fields)) return NextResponse.json({ error: 'fields[] required' }, { status: 400 })

  await pool.query('BEGIN')
  await pool.query('DELETE FROM hard_denied_info')
  if (fields.length > 0) {
    const vals = fields.map((_: unknown, i: number) => `($${i + 1})`).join(', ')
    await pool.query(`INSERT INTO hard_denied_info (field_key) VALUES ${vals}`, fields)
    // Remove hard-denied fields from all role visibility
    await pool.query(
      `DELETE FROM role_field_visibility WHERE field_key = ANY($1)`,
      [fields]
    )
  }
  await pool.query('COMMIT')
  return NextResponse.json({ ok: true })
}, ['admin'])
