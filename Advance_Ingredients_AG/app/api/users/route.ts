import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'

const VALID_ROLES = ['admin', 'staff', 'supplier', 'customer', 'accountant'] as const

// GET — list users with safe fields (admin/staff)
export const GET = withAuth(async () => {
  try {
    const { rows } = await pool.query(
      'SELECT user_id, name, role, company_name, created_at FROM users ORDER BY created_at DESC'
    )
    return NextResponse.json(rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin', 'staff'])

// POST — create user (admin only)
export const POST = withAuth(async (req) => {
  try {
    const { name, role, password } = await req.json()

    if (!name || !role || !password) {
      return NextResponse.json({ error: 'name, role, and password required' }, { status: 400 })
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(password, 12)

    const { rows } = await pool.query(
      `INSERT INTO users (name, role, password_hash)
       VALUES ($1, $2, $3)
       RETURNING user_id, name, role, company_name, address, city, country, created_at`,
      [name, role, password_hash]
    )

    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: any) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin'])
