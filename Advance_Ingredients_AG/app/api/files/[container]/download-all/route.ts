import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'
import { JWTPayload } from '@/types'
import { getFilePath } from '@/lib/file-storage'
import fs from 'fs'
import archiver from 'archiver'

async function canAccessOrder(containerNumber: string, user: JWTPayload): Promise<boolean> {
  if (user.role === 'admin') return true
  if (user.role === 'staff') {
    const { rows } = await pool.query(
      `SELECT 1 FROM order_visibility WHERE container_number=$1 AND role='staff'`,
      [containerNumber]
    )
    return rows.length > 0
  }
  return false
}

export const GET = withAuth(async (_req, user: JWTPayload, context) => {
  const container = context?.params?.container as string

  if (!(await canAccessOrder(container, user))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { rows } = await pool.query(
      `SELECT f.*, om.year, om.month
       FROM order_files f
       LEFT JOIN order_month om ON f.container_number = om.container_number
       WHERE f.container_number=$1
       ORDER BY f.uploaded_at DESC`,
      [container]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No files to download' }, { status: 404 })
    }

    const archive = archiver('zip', { zlib: { level: 6 } })
    const chunks: Buffer[] = []

    await new Promise<void>((resolve, reject) => {
      archive.on('data', (chunk: Buffer) => chunks.push(chunk))
      archive.on('end', resolve)
      archive.on('error', reject)

      for (const file of rows) {
        const filePath = getFilePath(file.year ?? null, file.month ?? null, container, file.stored_name)
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: file.filename })
        }
      }

      archive.finalize()
    })

    const buffer = Buffer.concat(chunks)
    const zipName = `${container}-files.zip`

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(zipName)}"`,
        'Content-Length': String(buffer.length),
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin', 'staff'])
