import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'
import { htmlToPdf } from '@/lib/pdf'
import { buildContractHtml } from '@/lib/contract-template'
import { Order } from '@/types'

export const GET = withAuth(async (_req, _user, context) => {
  try {
    const container = context.params.container

    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE container_number = $1',
      [container]
    )

    if (!rows[0]) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const order = rows[0] as Order
    const html = buildContractHtml(order)
    const pdf = await htmlToPdf(html)

    const filename = `${container}-contract-${order.contract_id ?? 'draft'}.pdf`

    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdf.length),
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}, ['admin', 'staff'])
