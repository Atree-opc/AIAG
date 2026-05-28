import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withAuth } from '@/lib/middleware-helpers'
import { JWTPayload } from '@/types'

const INSERT_COLUMNS = [
  'container_number', 'contract_id', 'customer_id', 'supplier_id', 'bl', 'brand', 'product',
  'price', 'quantity', 'quantity_unit', 'loading_date', 'etd', 'ship_on_board_date',
  'eta', 'batch_no', 'production_date', 'df_invoice_no', 'df_ai_price',
  'freight_forwarder', 'freight_forwarder_method', 'lc_number', 'port_of_loading', 'port_of_discharge',
  'status', 'remarks', 'belonged_month', 'belonged_quarter', 'parity', 'packing', 'payment_terms', 'origin', 'shelf_life',
  'invoice_no', 'lc_issue_date', 'lc_bank_name', 'lc_bank_bic', 'lc_bank_address',
  'buyer_name', 'buyer_address', 'is_organic', 'tc_contract_no', 'tc_invoice_no', 'tc_seller', 'tc_buyer',
]

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function quarterFromMonth(month: number) {
  return Math.ceil(month / 3)
}

function normalizeMonthKey(value: unknown): string | null {
  if (!value || String(value).trim() === '') return null
  const match = String(value).trim().match(/^(\d{4})-(\d{1,2})$/)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null
  return `${year}-${String(month).padStart(2, '0')}`
}

function normalizeQuarterKey(value: unknown): string | null {
  if (!value || String(value).trim() === '') return null
  const match = String(value).trim().match(/^(\d{4})-Q([1-4])$/i)
  if (!match) return null
  return `${match[1]}-Q${match[2]}`
}

function excelSerialToIsoDate(value: number): string | null {
  if (!Number.isFinite(value)) return null
  const wholeDays = Math.floor(value)
  if (wholeDays <= 0) return null
  const utcMillis = Date.UTC(1899, 11, 30) + wholeDays * 24 * 60 * 60 * 1000
  return new Date(utcMillis).toISOString().slice(0, 10)
}

function parseImportDate(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === 'number') {
    return excelSerialToIsoDate(value)
  }

  const text = String(value).trim()
  if (!text) return null

  if (/^\d+(\.\d+)?$/.test(text)) {
    return excelSerialToIsoDate(Number(text))
  }

  const normalized = text.replace(/\//g, '-')
  const exact = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (exact) {
    const year = Number(exact[1])
    const month = Number(exact[2])
    const day = Number(exact[3])
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }

  const parsed = new Date(text)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

async function resolveUserRef(
  client: Awaited<ReturnType<typeof pool.connect>>,
  rawValue: unknown,
  role: 'customer' | 'supplier'
): Promise<{ userId: string | null; error?: string }> {
  if (rawValue === null || rawValue === undefined) return { userId: null }

  const text = String(rawValue).trim()
  if (!text) return { userId: null }

  if (UUID_RE.test(text)) {
    return { userId: text }
  }

  const { rows } = await client.query(
    'SELECT user_id FROM users WHERE role = $1 AND name = $2 LIMIT 1',
    [role, text]
  )

  if (!rows[0]?.user_id) {
    return { userId: null, error: `${role} "${text}" not found` }
  }

  return { userId: rows[0].user_id as string }
}

function normalizeOrderRow(row: Record<string, unknown>) {
  return {
    ...row,
    container_number: row.container_number ?? row['container_number*'] ?? null,
  }
}

// POST — bulk import orders from Excel data
export const POST = withAuth(async (req: Request, _user: JWTPayload) => {
  try {
    const body = await req.json()
    const { orders, defaultBelongedMonth, defaultBelongedQuarter } = body

    if (!Array.isArray(orders)) {
      return NextResponse.json({ error: 'orders must be an array' }, { status: 400 })
    }

    if (orders.length === 0) {
      return NextResponse.json({ error: 'orders array is empty' }, { status: 400 })
    }

    const fallbackMonth = normalizeMonthKey(defaultBelongedMonth)
    const fallbackQuarter = normalizeQuarterKey(defaultBelongedQuarter)

    const client = await pool.connect()
    const results: Array<{ index: number; container_number: string; success: boolean; error?: string }> = []

    try {
      await client.query('BEGIN')

      for (let i = 0; i < orders.length; i++) {
        const row = normalizeOrderRow(orders[i] ?? {})

        // Validate container_number
        if (!row.container_number || String(row.container_number).trim() === '') {
          results.push({ index: i, container_number: '', success: false, error: 'container_number is required' })
          continue
        }

        // Check for duplicate container_number
        const { rows: existing } = await client.query(
          'SELECT container_number FROM orders WHERE container_number = $1',
          [row.container_number]
        )
        if (existing.length > 0) {
          results.push({ index: i, container_number: row.container_number, success: false, error: 'container_number already exists' })
          continue
        }

        // Validate and sanitize fields
        const customerRef = row.customer_id ?? row.customer_name
        const supplierRef = row.supplier_id ?? row.supplier_name
        const { userId: safeCustomerId, error: customerError } = await resolveUserRef(client, customerRef, 'customer')
        if (customerError) {
          results.push({ index: i, container_number: row.container_number, success: false, error: customerError })
          continue
        }
        const { userId: safeSupplierId, error: supplierError } = await resolveUserRef(client, supplierRef, 'supplier')
        if (supplierError) {
          results.push({ index: i, container_number: row.container_number, success: false, error: supplierError })
          continue
        }
        const safeBelongedMonth = normalizeMonthKey(row.belonged_month) ?? fallbackMonth
        const safeBelongedQuarter = normalizeQuarterKey(row.belonged_quarter)
          ?? (safeBelongedMonth
            ? `${safeBelongedMonth.slice(0, 4)}-Q${quarterFromMonth(Number(safeBelongedMonth.slice(5, 7)))}`
            : fallbackQuarter)

        // Process boolean fields
        const safeBoolean = (v: unknown) => {
          if (typeof v === 'boolean') return v
          if (typeof v === 'string') {
            const lower = v.toLowerCase().trim()
            return lower === 'true' || lower === 'yes' || lower === '1' || lower === '是'
          }
          return false
        }

        // Prepare values
        const values = [
          row.container_number,
          row.contract_id || null,
          safeCustomerId,
          safeSupplierId,
          row.bl || null,
          row.brand || null,
          row.product || null,
          row.price || null,
          row.quantity || null,
          row.quantity_unit || 'MT',
          parseImportDate(row.loading_date),
          parseImportDate(row.etd),
          parseImportDate(row.ship_on_board_date),
          parseImportDate(row.eta),
          row.batch_no || null,
          parseImportDate(row.production_date),
          row.df_invoice_no || null,
          row.df_ai_price || null,
          row.freight_forwarder || null,
          row.freight_forwarder_method || null,
          row.lc_number || null,
          row.port_of_loading || null,
          row.port_of_discharge || null,
          row.status || 'pending',
          row.remarks || null,
          safeBelongedMonth,
          safeBelongedQuarter,
          row.parity || null,
          row.packing || null,
          row.payment_terms || null,
          row.origin || null,
          row.shelf_life || null,
          row.invoice_no || null,
          parseImportDate(row.lc_issue_date),
          row.lc_bank_name || null,
          row.lc_bank_bic || null,
          row.lc_bank_address || null,
          row.buyer_name || null,
          row.buyer_address || null,
          safeBoolean(row.is_organic),
          row.tc_contract_no || null,
          row.tc_invoice_no || null,
          row.tc_seller || null,
          row.tc_buyer || null,
        ]

        // Insert order
        const placeholders = values.map((_, index) => `$${index + 1}`).join(',')
        const insertQuery = `
          INSERT INTO orders (${INSERT_COLUMNS.join(', ')})
          VALUES (${placeholders})
          RETURNING *
        `

        const { rows: inserted } = await client.query(insertQuery, values)

        // Add visibility
        await client.query(`
          INSERT INTO order_visibility (container_number, role) VALUES
          ($1, 'staff'), ($1, 'customer'), ($1, 'supplier')
        `, [row.container_number])

        results.push({ index: i, container_number: row.container_number, success: true })
      }

      await client.query('COMMIT')

      const successCount = results.filter(r => r.success).length
      const failureCount = results.filter(r => !r.success).length

      return NextResponse.json({
        message: `Import completed: ${successCount} succeeded, ${failureCount} failed`,
        total: orders.length,
        success: successCount,
        failed: failureCount,
        results
      })

    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }

  } catch (err) {
    console.error('Bulk import error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, ['admin', 'staff'])
