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

// Months to show in monthly view
type MonthPeriod = { key: string; label: string }
const MONTH_PERIODS: MonthPeriod[] = [
  { key: '2026-02', label: 'Feb 2026' },
  { key: '2026-01', label: 'Jan 2026' },
  { key: '2025-12', label: 'Dec 2025' },
  { key: '2025-11', label: 'Nov 2025' },
  { key: '2025-10', label: 'Oct 2025' },
  { key: '2025-09', label: 'Sep 2025' },
  { key: '2025-08', label: 'Aug 2025' },
  { key: '2025-07', label: 'Jul 2025' },
  { key: '2025-06', label: 'Jun 2025' },
  { key: '2025-05', label: 'May 2025' },
  { key: '2025-04', label: 'Apr 2025' },
  { key: '2025-03', label: 'Mar 2025' },
  { key: '2025-02', label: 'Feb 2025' },
  { key: '2025-01', label: 'Jan 2025' },
]

function getDisplayValue(order: Order, key: keyof Order): string {
  const v = order[key]
  if (v === null || v === undefined || v === '') return '—'
  if (key === 'status') return STATUS_LABELS[String(v)] ?? String(v)
  if (key === 'quantity') return `${v} ${order.quantity_unit ?? 'MT'}`
  if (DATE_FIELDS.has(key)) return String(v).slice(0, 10)
  return String(v)
}

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'list' | 'monthly'>('list')

  // Detail modal state (flat list)
  const [selected, setSelected] = useState<Order | null>(null)
  const [visibleFields, setVisibleFields] = useState<Set<string> | null>(null)
  const [editableFields, setEditableFields] = useState<Set<string>>(new Set())
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Monthly view state
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [activeCell, setActiveCell] = useState<{ cn: string; field: string } | null>(null)
  const [activeValue, setActiveValue] = useState('')
  const [savingRows, setSavingRows] = useState<Set<string>>(new Set())

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
        setVisibleFields(new Set(fieldsData.fields.map((f: { field_key: string } | string) => typeof f === 'string' ? f : f.field_key)))
        setEditableFields(new Set(fieldsData.fields.filter((f: { editable: boolean } | string) => typeof f !== 'string' && f.editable).map((f: { field_key: string } | string) => typeof f === 'string' ? f : f.field_key)))
      }
      setLoading(false)
    }
    load()
  }, [])

  // --- Flat list helpers ---
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

  // --- Monthly inline-edit helpers ---
  // Only show columns that are visible to this supplier
  const tableCols = ALL_FIELDS.filter(f =>
    f.key !== 'quantity_unit' && (visibleFields === null || visibleFields.has(f.key))
  )

  function startEdit(cn: string, field: string, current: string) {
    setActiveCell({ cn, field })
    setActiveValue(current)
  }

  async function commitEdit(cn: string, field: string, value: string) {
    setActiveCell(null)
    if (!editableFields.has(field)) return
    const order = orders.find(o => o.container_number === cn)
    if (!order) return
    const rawOrig = order[field as keyof Order]
    const original = rawOrig === null || rawOrig === undefined ? '' : String(rawOrig).trim()
    if (value.trim() === original) return
    setSavingRows(prev => new Set(prev).add(cn))
    const res = await fetch(`/api/orders/${cn}`, {
      method: 'PATCH', headers: authHeaders(),
      body: JSON.stringify({ [field]: value.trim() === '' ? null : value.trim() }),
    })
    if (res.ok) {
      const updated = await res.json()
      setOrders(prev => prev.map(o => o.container_number === cn ? updated : o))
    }
    setSavingRows(prev => { const s = new Set(prev); s.delete(cn); return s })
  }

  const [showAllRows, setShowAllRows] = useState(false)

  const allMonthOrders = selectedMonth
    ? orders.filter(o => o.belonged_month === selectedMonth)
    : []
  const monthOrders = showAllRows ? allMonthOrders : allMonthOrders.slice(0, 20)

  const hasDraft = Object.keys(draft).length > 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Orders / 我的订单</h1>
          <p className="text-sm text-text-secondary mt-0.5">{orders.length} orders visible to you</p>
        </div>
        {/* Tab switcher */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setTab('list')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'list' ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            All Orders / 全部订单
          </button>
          <button onClick={() => { setTab('monthly'); setSelectedMonth(null) }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'monthly' ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            Monthly / 按月查看
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-text-secondary text-sm">Loading... / 加载中...</p>
      ) : tab === 'list' ? (
        /* ── Flat list ── */
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-text-secondary text-xs">
                <th className="text-left px-4 py-3 font-medium">Container # / 航运货柜号</th>
                <th className="text-left px-4 py-3 font-medium">Contract / 合同</th>
                <th className="text-left px-4 py-3 font-medium">Product / 产品</th>
                <th className="text-left px-4 py-3 font-medium">Brand / 品牌</th>
                <th className="text-left px-4 py-3 font-medium">Qty / 数量</th>
                <th className="text-left px-4 py-3 font-medium">Loading Date / 提货日</th>
                <th className="text-left px-4 py-3 font-medium">ETD</th>
                <th className="text-left px-4 py-3 font-medium">Status / 状态</th>
                <th className="text-left px-4 py-3 font-medium">Detail / 详情</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-text-muted">No orders / 暂无订单</td></tr>
              )}
              {orders.map(order => (
                <tr key={order.container_number} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{order.container_number}</td>
                  <td className="px-4 py-3 font-mono text-xs">{order.contract_id ?? '—'}</td>
                  <td className="px-4 py-3">{order.product ?? '—'}</td>
                  <td className="px-4 py-3">{order.brand ?? '—'}</td>
                  <td className="px-4 py-3 text-xs">{order.quantity ? `${order.quantity} ${order.quantity_unit}` : '—'}</td>
                  <td className="px-4 py-3 text-xs">{order.loading_date?.slice(0, 10) ?? '—'}</td>
                  <td className="px-4 py-3 text-xs">{order.etd?.slice(0, 10) ?? '—'}</td>
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
      ) : !selectedMonth ? (
        /* ── Month grid ── */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {MONTH_PERIODS.map(p => {
            const count = orders.filter(o => o.belonged_month === p.key).length
            return (
              <button key={p.key} onClick={() => { setSelectedMonth(p.key); setShowAllRows(false) }}
                className="bg-white border border-gray-100 rounded-xl px-5 py-4 text-left hover:border-primary hover:shadow-sm transition-all">
                <div className="text-base font-semibold text-text-primary">{p.label}</div>
                <div className="text-xs text-text-secondary mt-1">{count} order{count !== 1 ? 's' : ''}</div>
              </button>
            )
          })}
        </div>
      ) : (
        /* ── Monthly inline table ── */
        <div>
          <button onClick={() => setSelectedMonth(null)} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4">
            ← Back / 返回
          </button>
          <h2 className="text-base font-semibold text-text-primary mb-4">
            {MONTH_PERIODS.find(m => m.key === selectedMonth)?.label ?? selectedMonth}
            <span className="ml-2 text-sm text-text-secondary font-normal">
              — {allMonthOrders.length} orders · click editable cell to fill / 点击可编辑单元格填写
            </span>
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
            <table className="text-sm border-collapse" style={{ minWidth: `${tableCols.length * 120}px` }}>
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-text-secondary">
                  {tableCols.map(col => {
                    const isStatus = col.key === 'status'
                    const isRemarks = col.key === 'remarks'
                    return (
                      <th key={col.key} style={{ minWidth: isStatus ? 190 : isRemarks ? 280 : 110 }}
                        className="text-left px-3 py-2.5 font-medium whitespace-nowrap">
                        {col.label.split(' / ')[0]}
                        {editableFields.has(col.key) && <span className="ml-1 text-primary text-xs">✎</span>}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {allMonthOrders.length === 0 && (
                  <tr><td colSpan={tableCols.length} className="px-4 py-8 text-center text-text-muted">No orders this month / 本月暂无订单</td></tr>
                )}
                {monthOrders.map(order => {
                  const isSaving = savingRows.has(order.container_number)
                  return (
                    <tr key={order.container_number} className={`border-b border-gray-50 ${isSaving ? 'opacity-60' : 'hover:bg-blue-50/30'} transition-colors`}>
                      {tableCols.map(col => {
                        const isEditable = editableFields.has(col.key)
                        const isActive = activeCell?.cn === order.container_number && activeCell?.field === col.key
                        const rawVal = order[col.key]
                        const cellVal = rawVal === null || rawVal === undefined ? '' : (DATE_FIELDS.has(col.key) ? String(rawVal).slice(0, 10) : String(rawVal))
                        const displayVal = col.key === 'status' ? (STATUS_LABELS[cellVal] ?? cellVal) : cellVal
                        const isStatus = col.key === 'status'
                        const isRemarks = col.key === 'remarks'
                        const cellMinW = isStatus ? 190 : isRemarks ? 280 : 110

                        if (col.key === 'container_number') {
                          return (
                            <td key={col.key} style={{ minWidth: cellMinW }} className="px-3 py-2 font-mono font-semibold whitespace-nowrap text-text-primary">
                              {cellVal || '—'}
                            </td>
                          )
                        }
                        if (col.key === 'status' && isEditable) {
                          return (
                            <td key={col.key} style={{ minWidth: cellMinW }} className="px-3 py-1.5">
                              <select
                                value={cellVal}
                                onChange={e => commitEdit(order.container_number, col.key, e.target.value)}
                                className="border border-transparent hover:border-gray-200 rounded px-2 py-1 text-sm bg-transparent focus:outline-none focus:border-primary w-full"
                              >
                                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                              </select>
                            </td>
                          )
                        }
                        if (!isEditable) {
                          return (
                            <td key={col.key} style={{ minWidth: cellMinW }} className="px-3 py-2 text-text-primary whitespace-nowrap">
                              {displayVal || '—'}
                            </td>
                          )
                        }
                        return (
                          <td key={col.key} style={{ minWidth: cellMinW }} className="px-3 py-1.5">
                            {isActive ? (
                              <input
                                autoFocus
                                type={DATE_FIELDS.has(col.key) ? 'date' : 'text'}
                                value={activeValue}
                                onChange={e => setActiveValue(e.target.value)}
                                onBlur={e => commitEdit(order.container_number, col.key, e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                                  if (e.key === 'Escape') setActiveCell(null)
                                }}
                                className="w-full border border-primary rounded px-2 py-1 text-sm focus:outline-none bg-white"
                              />
                            ) : (
                              <button
                                onClick={() => startEdit(order.container_number, col.key, cellVal)}
                                className="w-full text-left px-2 py-1 rounded hover:bg-white hover:border hover:border-gray-200 border border-transparent text-text-primary"
                                style={{ minWidth: cellMinW - 24 }}
                                title={cellVal}
                              >
                                {displayVal || <span className="text-text-muted">—</span>}
                              </button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {/* Show more / show less */}
            {allMonthOrders.length > 20 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-text-secondary">
                  Showing {monthOrders.length} of {allMonthOrders.length} orders / 显示 {monthOrders.length} / {allMonthOrders.length} 条
                </span>
                <button
                  onClick={() => setShowAllRows(v => !v)}
                  className="text-primary hover:underline font-medium"
                >
                  {showAllRows ? 'Show less / 收起' : `Show all ${allMonthOrders.length} / 显示全部`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail modal (flat list tab) */}
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
                    {isEditable && key === 'status' ? (
                      <select
                        value={getEditValue(selected, key)}
                        onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                        className={`w-full border rounded px-2 py-1 text-sm focus:outline-none focus:border-primary ${draft[key] !== undefined ? 'border-primary' : 'border-gray-200'}`}
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    ) : isEditable ? (
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
            <FileManager containerNumber={selected.container_number} canUpload={true} canDelete={false} userRole="supplier" />
          </div>
        </div>
      )}
    </div>
  )
}
