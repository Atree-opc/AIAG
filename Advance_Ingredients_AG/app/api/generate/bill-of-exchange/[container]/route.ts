import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'
import { htmlToPdf } from '@/lib/pdf'
import { buildBillOfExchangeHtml } from '@/lib/bill-of-exchange-template'
import { Order } from '@/types'

export const GET = withAuth(async (_req, _user, context) => {
  try {
    const container = context.params.container

    const { rows } = await pool.query(`
      SELECT o.*, u.name AS customer_name
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.user_id
      WHERE o.container_number = $1
    `, [container])

    if (!rows[0]) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const row = rows[0]
    const order = row as Order
    const customerName: string = row.customer_name ?? 'N/A'

    const html = buildBillOfExchangeHtml(order, customerName)
    const pdf = await htmlToPdf(html)

    const lcSuffix = order.lc_number ? `LC${order.lc_number}` : 'draft'
    const filename = `${container}-${lcSuffix}.pdf`

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
