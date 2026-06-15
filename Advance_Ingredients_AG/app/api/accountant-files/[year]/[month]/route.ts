import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'
import { JWTPayload } from '@/types'
import {
  ensureAccountantDir, generateStoredName, getAccountantFilePath,
  ALLOWED_MIME_TYPES, MAX_FILE_SIZE,
} from '@/lib/file-storage'
import fs from 'fs'

// GET /api/accountant-files/[year]/[month] — list files
export const GET = withAuth(async (_req, _user: JWTPayload, context) => {
  const year = parseInt(context?.params?.year as string)
  const month = parseInt(context?.params?.month as string)
  if (!year || !month) return NextResponse.json({ error: 'Invalid period' }, { status: 400 })

  try {
    const { rows } = await pool.query(
      `SELECT f.*, u.name AS uploaded_by_name
       FROM accountant_files f
       LEFT JOIN users u ON f.uploaded_by = u.user_id
       WHERE f.year = $1 AND f.month = $2
       ORDER BY f.uploaded_at DESC`,
      [year, month]
    )
    return NextResponse.json(rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin', 'staff', 'accountant'])

// POST /api/accountant-files/[year]/[month] — upload (admin/staff only)
export const POST = withAuth(async (req, user: JWTPayload, context) => {
  const year = parseInt(context?.params?.year as string)
  const month = parseInt(context?.params?.month as string)
  if (!year || !month) return NextResponse.json({ error: 'Invalid period' }, { status: 400 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 50MB limit' }, { status: 400 })
    }

    const storedName = generateStoredName(file.name)
    ensureAccountantDir(year, month)
    const filePath = getAccountantFilePath(year, month, storedName)

    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, buffer)

    const { rows } = await pool.query(
      `INSERT INTO accountant_files (year, month, filename, stored_name, file_size, mime_type, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [year, month, file.name, storedName, file.size, file.type, user.userId]
    )

    return NextResponse.json(rows[0], { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin', 'staff'])
