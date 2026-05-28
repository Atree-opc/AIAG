'use client'

import { useEffect, useState } from 'react'
import { Order } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  pending:    '待处理 Pending',
  production: '生产中 In Production',
  shipped:    '已装船 Shipped',
  arrived:    '已到港 Arrived',
  completed:  '已完成 Completed',
}

const DATE_FIELDS = new Set(['loading_date','etd','ship_on_board_date','eta','production_date','lc_issue_date'])

const ALL_FIELD_LABELS: Record<string, string> = {
  container_number:   'Container No. / 货柜号',
  contract_id:        'Contract ID / 合同号',
  brand:              'Brand / 品牌',
  product:            'Product / 产品',
  quantity:           'Quantity / 数量',
  price:              'Price €/kg / 单价',
  invoice_no:         'Invoice No.',
  parity:             'Parity',
  payment_terms:      'Payment Terms',
  lc_number:          'L/C Number / 信用证号',
  lc_issue_date:      'L/C Issue Date / 开证日期',
  lc_bank_name:       'L/C Bank / 开证行',
  lc_bank_bic:        'L/C Bank BIC',
  lc_bank_address:    'L/C Bank Address / 开证行地址',
  buyer_name:         'Buyer / 买方',
  buyer_address:      'Buyer Address / 买方地址',
  status:             'Status / 状态',
  belonged_month:     'Month / 月份',
}

function getDisplayValue(order: Record<string, unknown>, key: string): string {
  const v = order[key]
  if (v === null || v === undefined || v === '') return '—'
  if (key === 'status') return STATUS_LABELS[String(v)] ?? String(v)
  if (key === 'quantity') return `${v} ${(order.quantity_unit as string) ?? 'MT'}`
  if (DATE_FIELDS.has(key)) return String(v).slice(0, 10)
  return String(v)
}

export default function AccountantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)
  const [visibleFields, setVisibleFields] = useState<string[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/role-fields?role=accountant').then(r => r.json()),
    ]).then(([ordersData, fieldsData]) => {
      setOrders(Array.isArray(ordersData) ? ordersData : [])
      const fields: string[] = Array.isArray(fieldsData.fields)
        ? fieldsData.fields.map((f: { field_key: string } | string) =>
            typeof f === 'string' ? f : f.field_key)
        : []
      setVisibleFields(fields.length > 0 ? fields : ['container_number'])
      setLoading(false)
    })
  }, [])

  const tableFields = visibleFields.filter(k => !['buyer_address','lc_bank_address','buyer_name','lc_bank_name','lc_bank_bic'].includes(k))

  if (loading) return <p className="text-sm text-text-secondary">Loading... / 加载中...</p>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Orders / 订单查看</h1>
        <p className="text-sm text-text-secondary mt-0.5">Read-only view / 只读视图</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {tableFields.map(key => (
                  <th key={key} className="text-left px-4 py-3 text-xs font-medium text-text-secondary whitespace-nowrap">
                    {ALL_FIELD_LABELS[key] ?? key}
                  </th>
                ))}
                <th className="px-4 py-3 text-xs font-medium text-text-secondary">Detail</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={tableFields.length + 1} className="px-4 py-8 text-center text-sm text-text-muted">No orders / 暂无订单</td></tr>
              ) : orders.map(order => (
                <tr key={order.container_number} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  {tableFields.map(key => (
                    <td key={key} className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                      {getDisplayValue(order as unknown as Record<string, unknown>, key)}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(order)} className="text-xs text-primary hover:underline">
                      View / 查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">{selected.container_number}</h2>
              <button onClick={() => setSelected(null)} className="text-text-muted hover:text-text-primary text-xl">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {visibleFields.map(key => (
                <div key={key} className={key.includes('address') ? 'col-span-2' : ''}>
                  <p className="text-xs text-text-secondary mb-0.5">{ALL_FIELD_LABELS[key] ?? key}</p>
                  <p className="text-sm text-text-primary">{getDisplayValue(selected as unknown as Record<string, unknown>, key)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
