import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'
import { JWTPayload } from '@/types'

// GET /api/files/search?q=... — search files by filename or container number
export const GET = withAuth(async (req: Request, _user: JWTPayload) => {
  const url = new URL(req.url)
  const q = url.searchParams.get('q')?.trim() ?? ''
  if (!q) return NextResponse.json([])

  try {
    const { rows } = await pool.query(
      `SELECT f.file_id, f.container_number, f.filename, f.file_size, f.mime_type,
              f.uploaded_at, u.name AS uploaded_by_name
       FROM order_files f
       LEFT JOIN users u ON f.uploaded_by = u.user_id
       WHERE f.filename ILIKE $1 OR f.container_number ILIKE $1
       ORDER BY f.uploaded_at DESC
       LIMIT 50`,
      [`%${q}%`]
    )
    return NextResponse.json(rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin', 'staff'])
