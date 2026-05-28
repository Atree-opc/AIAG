import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'

const VALID_ROLES = ['admin', 'staff', 'supplier', 'customer', 'accountant'] as const

// GET — single user (admin only)
export const GET = withAuth(async (_req, _user, context) => {
  try {
    const id = context.params.id
    const { rows } = await pool.query(
      'SELECT user_id, name, role, company_name, address, city, country, created_at FROM users WHERE user_id = $1',
      [id]
    )
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin'])

// PATCH — update user (admin only)
export const PATCH = withAuth(async (req, _user, context) => {
  try {
    const id = context.params.id
    const { name, role, password, company_name, address, city, country } = await req.json()

    const updates: string[] = []
    const values: unknown[] = []

    if (name) { updates.push(`name = $${updates.length + 1}`); values.push(name) }
    if (role) {
      if (!VALID_ROLES.includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
      updates.push(`role = $${updates.length + 1}`)
      values.push(role)
    }
    if (password) {
      const hash = await bcrypt.hash(password, 12)
      updates.push(`password_hash = $${updates.length + 1}`)
      values.push(hash)
    }
    if (company_name !== undefined) { updates.push(`company_name = $${updates.length + 1}`); values.push(company_name || null) }
    if (address !== undefined) { updates.push(`address = $${updates.length + 1}`); values.push(address || null) }
    if (city !== undefined) { updates.push(`city = $${updates.length + 1}`); values.push(city || null) }
    if (country !== undefined) { updates.push(`country = $${updates.length + 1}`); values.push(country || null) }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    values.push(id)
    const { rows } = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${values.length}
       RETURNING user_id, name, role, company_name, address, city, country, created_at`,
      values
    )
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err: any) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin'])

// DELETE — admin only
export const DELETE = withAuth(async (_req, _user, context) => {
  try {
    const id = context.params.id
    const { rowCount } = await pool.query('DELETE FROM users WHERE user_id = $1', [id])
    if (!rowCount) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin'])
