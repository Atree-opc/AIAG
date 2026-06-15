'use client'

import { useEffect, useState } from 'react'
import { Order } from '@/types'
import FileManager from '@/components/FileManager'

const STATUS_LABELS: Record<string, string> = {
  pending:    '待处理 Pending',
  production: '生产中 In Production',
  shipped:    '已装船 Shipped',
  arrived:    '已到港 Arrived',
  completed:  '已完成 Completed',
}

function authHeaders() {
  return { 'Content-Type': 'application/json' }
}

const ALL_FIELDS: { key: keyof Order; label: string }[] = [
  { key: 'container_number',   label: 'Container No. / 货柜号' },
  { key: 'contract_id',        label: 'Contract ID / 合同号' },
  { key: 'brand',              label: 'Brand / 品牌' },
  { key: 'product',            label: 'Product / 产品' },
  { key: 'bl',                 label: 'B/L / 提单号' },
  { key: 'price',              label: 'Price €/kg / 单价' },
  { key: 'quantity',           label: 'Quantity / 数量' },
  { key: 'loading_date',       label: 'Loading Date / 提货日' },
  { key: 'etd',                label: 'ETD / 预计离港' },
  { key: 'ship_on_board_date', label: 'On Board / 真实离港' },
  { key: 'eta',                label: 'ETA / 预计到港' },
  { key: 'batch_no',           label: 'Batch No. / 批次号' },
  { key: 'production_date',    label: 'Production Date / 生产日期' },
  { key: 'df_invoice_no',      label: 'DF Invoice No.' },
  { key: 'df_ai_price',        label: 'DF-AI Price / 进价' },
  { key: 'freight_forwarder',  label: 'Freight/Forwarder / 货代' },
  { key: 'freight_forwarder_method', label: 'Freight/Forwarder Method / 货运方式及货柜安排方' },
  { key: 'lc_number',          label: 'L/C Number / 信用证号' },
  { key: 'port_of_loading',    label: 'Port of Loading / 装货港' },
  { key: 'port_of_discharge',  label: 'Port of Discharge / 卸货港' },
  { key: 'status',             label: 'Status / 状态' },
  { key: 'remarks',            label: 'Container # / 航运货柜号' },
  { key: 'is_organic',         label: 'Is Organic / 是否有机产品' },
  { key: 'tc_contract_no',     label: 'TC Contract No. / 有机销售证用合同号' },
  { key: 'tc_invoice_no',      label: 'TC Invoice No. / 有机销售证用发票号' },
  { key: 'tc_seller',          label: 'TC Seller / 有机销售证卖方' },
  { key: 'tc_buyer',           label: 'TC Buyer / 有机销售证买方' },
]

const DATE_FIELDS = new Set(['loading_date','etd','ship_on_board_date','eta','production_date'])

function getDisplayValue(order: Order, key: keyof Order): string {
  const v = order[key]
  if (v === null || v === undefined || v === '') return '—'
  if (key === 'status') return STATUS_LABELS[String(v)] ?? String(v)
  if (key === 'quantity') return `${v} ${order.quantity_unit ?? 'MT'}`
  if (DATE_FIELDS.has(key)) return String(v).slice(0, 10)
  return String(v)
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)
  const [visibleFields, setVisibleFields] = useState<Set<string> | null>(null)
  const [editableFields, setEditableFields] = useState<Set<string>>(new Set())
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    async function load() {
      const [ordersRes, fieldsRes] = await Promise.all([
        fetch('/api/orders', { headers: authHeaders() }),
        fetch('/api/role-fields', { headers: authHeaders() }),
      ])
      const ordersData = await ordersRes.json()
      const fieldsData = await fieldsRes.json()
      setOrders(Array.isArray(ordersData) ? ordersData : [])
      if (Array.isArray(fieldsData.fields)) {
        setVisibleFields(new Set(fieldsData.fields.map((f: any) => typeof f === 'string' ? f : f.field_key)))
        setEditableFields(new Set(fieldsData.fields.filter((f: any) => f.editable).map((f: any) => f.field_key)))
      }
      setLoading(false)
    }
    load()
  }, [])

  const detailFields = ALL_FIELDS.filter(f =>
    f.key !== 'quantity_unit' && (visibleFields === null || visibleFields.has(f.key))
  )

  function openDetail(order: Order) {
    setSelected(order); setDraft({}); setSaveError('')
  }

  function getEditValue(order: Order, key: keyof Order): string {
    if (draft[key] !== undefined) return draft[key]
    const v = order[key]
    if (v === null || v === undefined) return ''
    if (DATE_FIELDS.has(key)) return String(v).slice(0, 10)
    return String(v)
  }

  async function handleSave() {
    if (!selected || Object.keys(draft).length === 0) return
    setSaving(true); setSaveError('')
    const res = await fetch(`/api/orders/${selected.container_number}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify(draft),
    })
    const data = await res.json()
    if (!res.ok) { setSaveError(data.error ?? 'Save failed'); setSaving(false); return }
    setOrders(prev => prev.map(o => o.container_number === data.container_number ? data : o))
    setSelected(data); setDraft({}); setSaving(false)
  }

  const hasDraft = Object.keys(draft).length > 0
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">My Orders / 我的订单</h1>
        <p className="text-sm text-text-secondary mt-0.5">{orders.length} orders</p>
      </div>

      {loading ? (
        <p className="text-text-secondary text-sm">Loading... / 加载中...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-text-secondary text-xs">
                <th className="text-left px-4 py-3 font-medium">Contract / 合同</th>
                <th className="text-left px-4 py-3 font-medium">Product / 产品</th>
                <th className="text-left px-4 py-3 font-medium">Brand / 品牌</th>
                <th className="text-left px-4 py-3 font-medium">Qty / 数量</th>
                <th className="text-left px-4 py-3 font-medium">ETD / 预计离港</th>
                <th className="text-left px-4 py-3 font-medium">ETA / 预计到港</th>
                <th className="text-left px-4 py-3 font-medium">Status / 状态</th>
                <th className="text-left px-4 py-3 font-medium">Detail / 详情</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-text-muted">No orders / 暂无订单</td></tr>
              )}
              {orders.map(order => (
                <tr key={order.container_number} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{order.contract_id ?? '—'}</td>
                  <td className="px-4 py-3">{order.product ?? '—'}</td>
                  <td className="px-4 py-3">{order.brand ?? '—'}</td>
                  <td className="px-4 py-3 text-xs">{order.quantity ? `${order.quantity} ${order.quantity_unit}` : '—'}</td>
                  <td className="px-4 py-3 text-xs">{order.etd?.slice(0, 10) ?? '—'}</td>
                  <td className="px-4 py-3 text-xs">{order.eta?.slice(0, 10) ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-text-secondary">
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openDetail(order)} className="text-xs text-blue-600 hover:underline">View / 查看</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Order Detail / 订单详情</h2>
              <div className="flex items-center gap-3">
                {saveError && <span className="text-xs text-red-600">{saveError}</span>}
                {hasDraft && (
                  <button onClick={handleSave} disabled={saving}
                    className="text-sm px-4 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium disabled:opacity-60">
                    {saving ? 'Saving...' : 'Save / 保存'}
                  </button>
                )}
                <button onClick={() => setSelected(null)} className="text-text-muted hover:text-text-primary text-xl leading-none">&times;</button>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              {detailFields.filter(f => f.key !== 'remarks').map(({ key, label }) => {
                const isEditable = editableFields.has(key)
                return (
                  <div key={key}>
                    <dt className="text-xs text-text-secondary mb-0.5">{label}{isEditable && <span className="ml-1 text-primary">✎</span>}</dt>
                    {isEditable ? (
                      <input
                        type={DATE_FIELDS.has(key) ? 'date' : 'text'}
                        value={getEditValue(selected, key)}
                        onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                        className={`w-full border rounded px-2 py-1 text-sm focus:outline-none focus:border-primary ${draft[key] !== undefined ? 'border-primary' : 'border-gray-200'}`}
                      />
                    ) : (
                      <dd className="text-sm text-text-primary">{getDisplayValue(selected, key)}</dd>
                    )}
                  </div>
                )
              })}
              {detailFields.some(f => f.key === 'remarks') && (
                <div className="col-span-2">
                  <dt className="text-xs text-text-secondary mb-0.5">Container # / 航运货柜号{editableFields.has('remarks') && <span className="ml-1 text-primary">✎</span>}</dt>
                  {editableFields.has('remarks') ? (
                    <textarea value={getEditValue(selected, 'remarks')} onChange={e => setDraft(d => ({ ...d, remarks: e.target.value }))}
                      rows={3} className={`w-full border rounded px-2 py-1 text-sm focus:outline-none focus:border-primary resize-none ${draft['remarks'] !== undefined ? 'border-primary' : 'border-gray-200'}`} />
                  ) : (
                    selected.remarks && <dd className="text-sm text-text-primary">{selected.remarks}</dd>
                  )}
                </div>
              )}
            </dl>
            <FileManager containerNumber={selected.container_number} canUpload={false} canDelete={false} userRole="customer" />
          </div>
        </div>
      )}
    </div>
  )
}
