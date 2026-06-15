import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'
import { JWTPayload } from '@/types'
import { getAccountantFilePath, deleteAccountantFile } from '@/lib/file-storage'
import fs from 'fs'

// GET /api/accountant-files/[year]/[month]/[fileId] — download
export const GET = withAuth(async (_req, _user: JWTPayload, context) => {
  const year = parseInt(context?.params?.year as string)
  const month = parseInt(context?.params?.month as string)
  const fileId = context?.params?.fileId as string

  try {
    const { rows } = await pool.query(
      'SELECT * FROM accountant_files WHERE file_id=$1 AND year=$2 AND month=$3',
      [fileId, year, month]
    )
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const file = rows[0]
    const filePath = getAccountantFilePath(year, month, file.stored_name)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }

    const buffer = fs.readFileSync(filePath)
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.filename)}"`,
        'Content-Length': String(buffer.length),
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin', 'staff', 'accountant'])

// DELETE /api/accountant-files/[year]/[month]/[fileId] — delete (admin/staff only)
export const DELETE = withAuth(async (_req, _user: JWTPayload, context) => {
  const year = parseInt(context?.params?.year as string)
  const month = parseInt(context?.params?.month as string)
  const fileId = context?.params?.fileId as string

  try {
    const { rows } = await pool.query(
      'SELECT * FROM accountant_files WHERE file_id=$1 AND year=$2 AND month=$3',
      [fileId, year, month]
    )
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    deleteAccountantFile(year, month, rows[0].stored_name)
    await pool.query('DELETE FROM accountant_files WHERE file_id=$1', [fileId])
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin', 'staff'])
