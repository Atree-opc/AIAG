'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Order, User } from '@/types'
import ExcelImport from '@/components/ExcelImport'

type ColDef = { key: string; label: string; type: 'text' | 'number' | 'date' | 'select'; readOnly?: boolean; minWidth: number }

const TABLE_COLS: ColDef[] = [
  { key: 'container_number',        label: 'Container',           type: 'text',   readOnly: true, minWidth: 140 },
  { key: 'contract_id',             label: 'Contract',            type: 'text',                   minWidth: 110 },
  { key: 'bl',                      label: 'B/L',                 type: 'text',                   minWidth: 100 },
  { key: 'brand',                   label: 'Brand',               type: 'text',                   minWidth: 100 },
  { key: 'product',                 label: 'Product',             type: 'text',                   minWidth: 110 },
  { key: 'price',                   label: 'Price €/kg',          type: 'number',                 minWidth: 90 },
  { key: 'quantity',                label: 'Qty',                 type: 'number',                 minWidth: 80 },
  { key: 'quantity_unit',           label: 'Unit',                type: 'text',                   minWidth: 70 },
  { key: 'loading_date',            label: 'Loading',             type: 'date',                   minWidth: 120 },
  { key: 'etd',                     label: 'ETD',                 type: 'date',                   minWidth: 120 },
  { key: 'ship_on_board_date',      label: 'On Board',            type: 'date',                   minWidth: 120 },
  { key: 'eta',                     label: 'ETA',                 type: 'date',                   minWidth: 120 },
  { key: 'batch_no',                label: 'Batch No.',           type: 'text',                   minWidth: 110 },
  { key: 'production_date',         label: 'Prod. Date',          type: 'date',                   minWidth: 120 },
  { key: 'df_invoice_no',           label: 'DF Inv.',             type: 'text',                   minWidth: 110 },
  { key: 'df_ai_price',             label: 'DF-AI €',             type: 'number',                 minWidth: 90 },
  { key: 'freight_forwarder',       label: 'Forwarder',           type: 'text',                   minWidth: 130 },
  { key: 'freight_forwarder_method', label: 'Freight Method',     type: 'text',                   minWidth: 150 },
  { key: 'lc_number',               label: 'L/C No.',             type: 'text',                   minWidth: 110 },
  { key: 'port_of_loading',         label: 'POL',                 type: 'text',                   minWidth: 100 },
  { key: 'port_of_discharge',       label: 'POD',                 type: 'text',                   minWidth: 100 },
  { key: 'is_organic',              label: 'Is Organic',          type: 'select',                 minWidth: 100 },
  { key: 'tc_contract_no',          label: 'TC Contract',         type: 'text',                   minWidth: 120 },
  { key: 'tc_invoice_no',           label: 'TC Invoice',          type: 'text',                   minWidth: 120 },
  { key: 'tc_seller',               label: 'TC Seller',           type: 'text',                   minWidth: 150 },
  { key: 'tc_buyer',                label: 'TC Buyer',            type: 'text',                   minWidth: 150 },
  { key: 'status',                  label: 'Status',              type: 'select',                 minWidth: 190 },
  { key: 'remarks',                 label: 'Container #',         type: 'text',                   minWidth: 300 },
]

type FileSearchResult = {
  file_id: string
  container_number: string
  filename: string
  file_size: number | null
  mime_type: string | null
  uploaded_at: string
  uploaded_by_name: string | null
}

function formatSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function authHeaders() {
  return { 'Content-Type': 'application/json' }
}

const STATUS_LABELS: Record<string, string> = {
  pending:    '待处理 Pending',
  production: '生产中 In Production',
  shipped:    '已装船 Shipped',
  arrived:    '已到港 Arrived',
  completed:  '已完成 Completed',
}

const EMPTY_FORM = {
  container_number: '', contract_id: '', customer_id: '', supplier_id: '', bl: '',
  brand: '', product: '', price: '', quantity: '', quantity_unit: 'MT',
  loading_date: '', etd: '', ship_on_board_date: '', eta: '',
  batch_no: '', production_date: '', df_invoice_no: '', df_ai_price: '',
  freight_forwarder: '', freight_forwarder_method: '', lc_number: '', port_of_loading: '', port_of_discharge: '',
  status: 'pending', remarks: '',
  belonged_month: '', belonged_quarter: '',
  is_organic: 'false', tc_contract_no: '', tc_invoice_no: '', tc_seller: '', tc_buyer: '',
}

const editableFields = [
  ['contract_id', 'Contract ID / 合同号'],
  ['bl', 'B/L / 提单号'],
  ['brand', 'Brand / 品牌'],
  ['product', 'Product / 产品'],
  ['price', 'Price €/kg / 单价'],
  ['quantity', 'Quantity / 数量'],
  ['quantity_unit', 'Unit / 单位'],
  ['loading_date', 'Loading Date / 提货日'],
  ['etd', 'ETD / 预计离港'],
  ['ship_on_board_date', 'On Board Date / 真实离港'],
  ['eta', 'ETA / 预计到港'],
  ['batch_no', 'Batch No. / 批次号'],
  ['production_date', 'Production Date / 生产日期'],
  ['df_invoice_no', 'DF Invoice No.'],
  ['df_ai_price', 'DF-AI Price / 进价'],
  ['freight_forwarder', 'Freight/Forwarder / 货代'],
  ['freight_forwarder_method', 'Freight/Forwarder Method / 货运方式及货柜安排方'],
  ['lc_number', 'L/C Number / 信用证号'],
  ['port_of_loading', 'Port of Loading / 装货港'],
  ['port_of_discharge', 'Port of Discharge / 卸货港'],
  ['remarks', 'Container # / 航运货柜号'],
] as const

const dateFields = ['loading_date', 'etd', 'ship_on_board_date', 'eta', 'production_date']
const numberFields = ['price', 'quantity', 'df_ai_price']

type MonthPeriod = { key: string; label: string; year: number; month: number }
type QuarterPeriod = { key: string; label: string; year: number; quarter: number; months: number[] }

const BASE_MONTH_PERIODS: MonthPeriod[] = [
  { key: '2026-02', label: 'Feb 2026', year: 2026, month: 2 },
  { key: '2026-01', label: 'Jan 2026', year: 2026, month: 1 },
  { key: '2025-12', label: 'Dec 2025', year: 2025, month: 12 },
  { key: '2025-11', label: 'Nov 2025', year: 2025, month: 11 },
  { key: '2025-10', label: 'Oct 2025', year: 2025, month: 10 },
  { key: '2025-09', label: 'Sep 2025', year: 2025, month: 9 },
  { key: '2025-08', label: 'Aug 2025', year: 2025, month: 8 },
  { key: '2025-07', label: 'Jul 2025', year: 2025, month: 7 },
  { key: '2025-06', label: 'Jun 2025', year: 2025, month: 6 },
  { key: '2025-05', label: 'May 2025', year: 2025, month: 5 },
  { key: '2025-04', label: 'Apr 2025', year: 2025, month: 4 },
  { key: '2025-03', label: 'Mar 2025', year: 2025, month: 3 },
  { key: '2025-02', label: 'Feb 2025', year: 2025, month: 2 },
  { key: '2025-01', label: 'Jan 2025', year: 2025, month: 1 },
]

const BASE_QUARTER_PERIODS: QuarterPeriod[] = [
  { key: '2026-Q1', label: 'Q1 2026', year: 2026, quarter: 1, months: [1,2,3] },
  { key: '2025-Q4', label: 'Q4 2025', year: 2025, quarter: 4, months: [10,11,12] },
  { key: '2025-Q3', label: 'Q3 2025', year: 2025, quarter: 3, months: [7,8,9] },
  { key: '2025-Q2', label: 'Q2 2025', year: 2025, quarter: 2, months: [4,5,6] },
  { key: '2025-Q1', label: 'Q1 2025', year: 2025, quarter: 1, months: [1,2,3] },
]

function monthIndex(year: number, month: number) {
  return year * 12 + (month - 1)
}

function formatMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

function formatMonthLabel(year: number, month: number) {
  const date = new Date(year, month - 1, 1)
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

function quarterFromMonth(month: number) {
  return Math.ceil(month / 3)
}

function quarterMonths(quarter: number) {
  const start = (quarter - 1) * 3 + 1
  return [start, start + 1, start + 2]
}

function buildMonthPeriods(base: MonthPeriod[]): MonthPeriod[] {
  const periods = [...base]
  const existing = new Set(base.map(period => period.key))
  const latest = base.reduce(
    (max, period) => Math.max(max, monthIndex(period.year, period.month)),
    Number.NEGATIVE_INFINITY
  )
  const nextMonthDate = new Date()
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1)
  nextMonthDate.setDate(1)
  const target = monthIndex(nextMonthDate.getFullYear(), nextMonthDate.getMonth() + 1)

  for (let index = latest + 1; index <= target; index++) {
    const year = Math.floor(index / 12)
    const month = (index % 12) + 1
    const key = formatMonthKey(year, month)
    if (existing.has(key)) continue
    periods.push({ key, label: formatMonthLabel(year, month), year, month })
  }

  return periods.sort((a, b) => monthIndex(b.year, b.month) - monthIndex(a.year, a.month))
}

function buildQuarterPeriods(base: QuarterPeriod[], months: MonthPeriod[]): QuarterPeriod[] {
  const periods = [...base]
  const existing = new Set(base.map(period => period.key))

  for (const period of months) {
    const quarter = quarterFromMonth(period.month)
    const key = `${period.year}-Q${quarter}`
    if (existing.has(key)) continue
    existing.add(key)
    periods.push({
      key,
      label: `Q${quarter} ${period.year}`,
      year: period.year,
      quarter,
      months: quarterMonths(quarter),
    })
  }

  return periods.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.quarter - a.quarter
  })
}

const MONTH_PERIODS = buildMonthPeriods(BASE_MONTH_PERIODS)
const QUARTER_PERIODS = buildQuarterPeriods(BASE_QUARTER_PERIODS, MONTH_PERIODS)

export default function StaffOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'month' | 'quarter'>('month')
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [error, setError] = useState('')
  const [customers, setCustomers] = useState<User[]>([])
  const [suppliers, setSuppliers] = useState<User[]>([])
  const [activeCell, setActiveCell] = useState<{ cn: string; field: string } | null>(null)
  const [activeValue, setActiveValue] = useState('')
  const [savingRows, setSavingRows] = useState<Set<string>>(new Set())
  const [emptyRowCount, setEmptyRowCount] = useState(20)
  const [draftRows, setDraftRows] = useState<Record<number, Record<string, string>>>({})
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FileSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/users', { headers: authHeaders() })
      .then(r => r.json())
      .then(data => {
        const all = Array.isArray(data) ? data : []
        setCustomers(all.filter((u: User) => u.role === 'customer'))
        setSuppliers(all.filter((u: User) => u.role === 'supplier'))
      })
  }, [])

  async function fetchOrders() {
    setLoading(true)
    const res = await fetch('/api/orders', { headers: authHeaders() })
    const data = await res.json()
    setOrders(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  function ordersForMonth(monthKey: string): Order[] {
    return orders.filter(o => o.belonged_month === monthKey)
  }

  function ordersForQuarter(quarterKey: string): Order[] {
    return orders.filter(o => o.belonged_quarter === quarterKey)
  }

  function ordersUnassigned(): Order[] {
    return orders.filter(o => !o.belonged_month)
  }

  function openCreate() {
    const newForm = { ...EMPTY_FORM }
    if (selectedPeriod && selectedPeriod !== 'unassigned') {
      if (viewMode === 'month') {
        const p = MONTH_PERIODS.find(m => m.key === selectedPeriod)
        if (p) {
          newForm.belonged_month = p.key
          newForm.belonged_quarter = `${p.year}-Q${Math.ceil(p.month / 3)}`
        }
      } else {
        const p = QUARTER_PERIODS.find(q => q.key === selectedPeriod)
        if (p) newForm.belonged_quarter = p.key
      }
    }
    setForm(newForm)
    setShowForm(true)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.container_number.trim()) {
      setError('Container number is required / 货柜号必填')
      return
    }
    if (viewMode === 'quarter' && selectedPeriod !== 'unassigned' && !form.belonged_month) {
      setError('Please select a month / 请选择归属月份')
      return
    }
    const body = {
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      quantity: form.quantity ? parseFloat(form.quantity) : null,
      df_ai_price: form.df_ai_price ? parseFloat(form.df_ai_price) : null,
      customer_id: form.customer_id || null,
      supplier_id: form.supplier_id || null,
      belonged_month: form.belonged_month || null,
      belonged_quarter: form.belonged_quarter || null,
    }
    const res = await fetch('/api/orders', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Error'); return }
    setShowForm(false)
    fetchOrders()
  }

  async function handleDelete(containerNumber: string) {
    if (!confirm(`Delete order "${containerNumber}"? / 确认删除此订单？`)) return
    await fetch(`/api/orders/${containerNumber}`, { method: 'DELETE', headers: authHeaders() })
    fetchOrders()
  }

  async function handleSearch(q: string) {
    setSearchQuery(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (!q.trim()) { setSearchResults([]); setShowSearch(false); return }
    setShowSearch(true)
    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/files/search?q=${encodeURIComponent(q)}`, { headers: authHeaders() })
      const data = await res.json()
      setSearchResults(Array.isArray(data) ? data : [])
      setSearching(false)
    }, 300)
  }

  async function handleDownloadFile(containerNumber: string, fileId: string, filename: string) {
    const res = await fetch(`/api/files/${containerNumber}/${fileId}`, { headers: authHeaders() })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  function startEdit(cn: string, field: string, current: string) {
    setActiveCell({ cn, field })
    setActiveValue(current)
  }

  async function commitEdit(cn: string, field: string, value: string) {
    setActiveCell(null)
    const order = orders.find(o => o.container_number === cn)
    if (!order) return
    const original = (order[field as keyof Order] ?? '') as string
    const normalised = value.trim()
    if (normalised === (original === null || original === undefined ? '' : String(original).trim())) return
    setSavingRows(prev => new Set(prev).add(cn))

    // Handle boolean conversion for is_organic
    let payload: any = { [field]: normalised === '' ? null : normalised }
    if (field === 'is_organic') {
      payload = { [field]: normalised === 'true' }
    }

    const res = await fetch(`/api/orders/${cn}`, {
      method: 'PATCH', headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const updated = await res.json()
      setOrders(prev => prev.map(o => o.container_number === cn ? updated : o))
    }
    setSavingRows(prev => { const s = new Set(prev); s.delete(cn); return s })
  }

  async function commitDraftRow(rowIdx: number, field: string, value: string) {
    const row = { ...(draftRows[rowIdx] ?? {}), [field]: value }
    setDraftRows(prev => ({ ...prev, [rowIdx]: row }))

    // Only create order when container_number is filled
    if (field !== 'container_number' || !value.trim()) return
    const cn = value.trim()
    if (orders.some(o => o.container_number === cn)) return // already exists

    // Pre-fill period fields from current selection
    const base: Record<string, any> = { ...row }
    if (selectedPeriod && selectedPeriod !== 'unassigned') {
      if (viewMode === 'month') {
        const p = MONTH_PERIODS.find(m => m.key === selectedPeriod)
        if (p) {
          base.belonged_month = p.key
          base.belonged_quarter = `${p.year}-Q${Math.ceil(p.month / 3)}`
        }
      } else {
        const p = QUARTER_PERIODS.find(q => q.key === selectedPeriod)
        if (p) base.belonged_quarter = p.key
      }
    }

    // Convert is_organic to boolean
    if (base.is_organic !== undefined) {
      base.is_organic = base.is_organic === 'true'
    }

    setSavingRows(prev => new Set(prev).add(`__draft_${rowIdx}`))
    const res = await fetch('/api/orders', {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ container_number: cn, status: 'pending', ...base }),
    })
    if (res.ok) {
      const created = await res.json()
      setOrders(prev => [...prev, created])
      setDraftRows(prev => { const n = { ...prev }; delete n[rowIdx]; return n })
    }
    setSavingRows(prev => { const s = new Set(prev); s.delete(`__draft_${rowIdx}`); return s })
  }

  function handleTableScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
      setEmptyRowCount(prev => prev + 20)
    }
  }

  // Determine which orders to show in the selected period
  const periodOrders: Order[] = (() => {
    if (!selectedPeriod) return []
    if (selectedPeriod === 'unassigned') return ordersUnassigned()
    if (viewMode === 'month') return ordersForMonth(selectedPeriod)
    return ordersForQuarter(selectedPeriod)
  })()

  const selectedLabel = selectedPeriod === 'unassigned' ? 'Unassigned / 未分配'
    : viewMode === 'month'
      ? MONTH_PERIODS.find(m => m.key === selectedPeriod)?.label ?? ''
      : QUARTER_PERIODS.find(q => q.key === selectedPeriod)?.label ?? ''

  const quarterMonthOptions = (viewMode === 'quarter' && selectedPeriod && selectedPeriod !== 'unassigned')
    ? (() => {
        const q = QUARTER_PERIODS.find(p => p.key === selectedPeriod)
        if (!q) return []
        return MONTH_PERIODS.filter(m => m.year === q.year && q.months.includes(m.month))
      })()
    : []

  const importDefaultBelongedMonth = (() => {
    if (!selectedPeriod || selectedPeriod === 'unassigned') return null
    if (viewMode === 'month') return selectedPeriod
    return null
  })()

  const importDefaultBelongedQuarter = (() => {
    if (!selectedPeriod || selectedPeriod === 'unassigned') return null
    if (viewMode === 'quarter') return selectedPeriod
    const month = MONTH_PERIODS.find(m => m.key === selectedPeriod)
    return month ? `${month.year}-Q${Math.ceil(month.month / 3)}` : null
  })()

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Orders / 订单管理</h1>
          <p className="text-sm text-text-secondary mt-0.5">{orders.length} orders total</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search files... / 搜索文件..."
              className="w-64 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-8"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearch(false) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs">✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Excel Import */}
      <div className="mb-4">
        <ExcelImport
          defaultBelongedMonth={importDefaultBelongedMonth}
          defaultBelongedQuarter={importDefaultBelongedQuarter}
          onImportComplete={() => {
            fetchOrders()
          }}
        />
      </div>

      {/* Search results panel */}
      {showSearch && (
        <div className="bg-white rounded-xl border border-gray-100 mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">
              File Search Results / 文件搜索结果
              {!searching && <span className="text-text-secondary font-normal ml-2">({searchResults.length} found)</span>}
            </span>
            {searching && <span className="text-xs text-text-muted">Searching... / 搜索中...</span>}
          </div>
          {!searching && searchResults.length === 0 ? (
            <p className="px-4 py-6 text-sm text-text-muted text-center">No files found / 未找到文件</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-text-secondary">
                  <th className="text-left px-4 py-2 font-medium">Filename / 文件名</th>
                  <th className="text-left px-4 py-2 font-medium">Container / 货柜</th>
                  <th className="text-left px-4 py-2 font-medium">Size / 大小</th>
                  <th className="text-left px-4 py-2 font-medium">Uploaded by / 上传者</th>
                  <th className="text-left px-4 py-2 font-medium">Date / 日期</th>
                  <th className="px-4 py-2 text-right font-medium">Actions / 操作</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map(f => (
                  <tr key={f.file_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-2 max-w-[200px] truncate" title={f.filename}>{f.filename}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => router.push(`/portal/staff/orders/${f.container_number}`)}
                        className="text-blue-600 hover:underline font-mono">{f.container_number}</button>
                    </td>
                    <td className="px-4 py-2 text-text-secondary">{formatSize(f.file_size)}</td>
                    <td className="px-4 py-2 text-text-secondary">{f.uploaded_by_name ?? '—'}</td>
                    <td className="px-4 py-2 text-text-secondary">{f.uploaded_at?.slice(0, 10)}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => handleDownloadFile(f.container_number, f.file_id, f.filename)}
                        className="text-blue-600 hover:underline">Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* View mode toggle — only shown on period grid */}
      {!selectedPeriod && (
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'month' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-text-secondary hover:border-primary'}`}
          >
            Month / 月份
          </button>
          <button
            onClick={() => setViewMode('quarter')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'quarter' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-text-secondary hover:border-primary'}`}
          >
            Quarter / 季度
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-text-secondary text-sm">Loading... / 加载中...</p>
      ) : selectedPeriod ? (
        /* ── Period detail view ── */
        <div>
          <button onClick={() => setSelectedPeriod(null)} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4">
            ← Back / 返回
          </button>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">{selectedLabel}</h2>
            <button onClick={openCreate} className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              + New Order / 新建订单
            </button>
          </div>
          <div
            ref={tableContainerRef}
            onScroll={handleTableScroll}
            className="bg-white rounded-xl border border-gray-100 overflow-x-auto overflow-y-auto"
            style={{ maxHeight: '640px' }}
          >
            <table className="text-sm border-collapse" style={{ minWidth: `${TABLE_COLS.reduce((s, c) => s + c.minWidth, 0) + 100}px` }}>
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-gray-200 bg-gray-50 text-text-secondary">
                  {TABLE_COLS.map(col => (
                    <th key={col.key} style={{ minWidth: col.minWidth }} className="text-left px-3 py-2.5 font-medium whitespace-nowrap">{col.label}</th>
                  ))}
                  <th className="text-right px-3 py-2.5 font-medium sticky right-0 bg-gray-50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Existing order rows */}
                {periodOrders.map(order => {
                  const isSaving = savingRows.has(order.container_number)
                  return (
                    <tr key={order.container_number} className={`border-b border-gray-50 ${isSaving ? 'opacity-60' : 'hover:bg-blue-50/30'} transition-colors`}>
                      {TABLE_COLS.map(col => {
                        const isActive = activeCell?.cn === order.container_number && activeCell?.field === col.key
                        const rawVal = order[col.key as keyof Order]
                        const cellVal = rawVal === null || rawVal === undefined ? '' : (col.type === 'date' ? String(rawVal).slice(0, 10) : String(rawVal))
                        if (col.readOnly) {
                          return (
                            <td key={col.key} style={{ minWidth: col.minWidth }} className="px-3 py-2 font-mono font-semibold whitespace-nowrap">
                              <button onClick={() => router.push(`/portal/staff/orders/${order.container_number}?period=${selectedPeriod}&mode=${viewMode}`)}
                                className="text-blue-600 hover:underline">{cellVal || '—'}</button>
                            </td>
                          )
                        }
                        if (col.key === 'status') {
                          return (
                            <td key={col.key} style={{ minWidth: col.minWidth }} className="px-3 py-1.5">
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
                        if (col.key === 'is_organic') {
                          return (
                            <td key={col.key} style={{ minWidth: col.minWidth }} className="px-3 py-1.5">
                              <select
                                value={cellVal === 'true' || cellVal === '1' ? 'true' : 'false'}
                                onChange={e => commitEdit(order.container_number, col.key, e.target.value)}
                                className="border border-transparent hover:border-gray-200 rounded px-2 py-1 text-sm bg-transparent focus:outline-none focus:border-primary w-full"
                              >
                                <option value="false">No / 否</option>
                                <option value="true">Yes / 是</option>
                              </select>
                            </td>
                          )
                        }
                        return (
                          <td key={col.key} style={{ minWidth: col.minWidth }} className="px-3 py-1.5">
                            {isActive ? (
                              <input
                                autoFocus
                                type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                                step={col.type === 'number' ? '0.0001' : undefined}
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
                                style={{ minWidth: col.minWidth - 24 }}
                                title={cellVal}
                              >
                                {cellVal || <span className="text-text-muted">—</span>}
                              </button>
                            )}
                          </td>
                        )
                      })}
                      <td className="px-3 py-1.5 text-right whitespace-nowrap sticky right-0 bg-white">
                        <button onClick={() => handleDelete(order.container_number)}
                          className="text-red-400 hover:text-red-600 mr-3">Delete</button>
                        <button onClick={() => router.push(`/portal/staff/orders/${order.container_number}?period=${selectedPeriod}&mode=${viewMode}`)}
                          className="text-blue-600 hover:underline">→</button>
                      </td>
                    </tr>
                  )
                })}

                {/* Empty input rows */}
                {Array.from({ length: emptyRowCount }).map((_, rowIdx) => {
                  const rowDraft = draftRows[rowIdx] ?? {}
                  const isCreating = savingRows.has(`__draft_${rowIdx}`)
                  return (
                    <tr key={`empty-${rowIdx}`} className={`border-b border-gray-50 bg-gray-50/40 ${isCreating ? 'opacity-50' : ''}`}>
                      {TABLE_COLS.map(col => {
                        const val = rowDraft[col.key] ?? ''
                        if (col.key === 'status') {
                          return (
                            <td key={col.key} style={{ minWidth: col.minWidth }} className="px-3 py-1.5">
                              <select
                                value={val || 'pending'}
                                onChange={e => setDraftRows(prev => ({ ...prev, [rowIdx]: { ...(prev[rowIdx] ?? {}), [col.key]: e.target.value } }))}
                                className="border border-transparent hover:border-gray-200 rounded px-2 py-1 text-sm bg-transparent focus:outline-none focus:border-primary w-full text-text-muted"
                              >
                                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                              </select>
                            </td>
                          )
                        }
                        if (col.key === 'is_organic') {
                          return (
                            <td key={col.key} style={{ minWidth: col.minWidth }} className="px-3 py-1.5">
                              <select
                                value={val || 'false'}
                                onChange={e => setDraftRows(prev => ({ ...prev, [rowIdx]: { ...(prev[rowIdx] ?? {}), [col.key]: e.target.value } }))}
                                className="border border-transparent hover:border-gray-200 rounded px-2 py-1 text-sm bg-transparent focus:outline-none focus:border-primary w-full text-text-muted"
                              >
                                <option value="false">No / 否</option>
                                <option value="true">Yes / 是</option>
                              </select>
                            </td>
                          )
                        }
                        return (
                          <td key={col.key} style={{ minWidth: col.minWidth }} className="px-3 py-1.5">
                            <input
                              type={col.type === 'date' ? 'date' : col.type === 'number' ? 'number' : 'text'}
                              step={col.type === 'number' ? '0.0001' : undefined}
                              value={val}
                              placeholder={col.readOnly ? 'Container No.' : ''}
                              onChange={e => setDraftRows(prev => ({ ...prev, [rowIdx]: { ...(prev[rowIdx] ?? {}), [col.key]: e.target.value } }))}
                              onBlur={e => { if (col.readOnly) commitDraftRow(rowIdx, col.key, e.target.value) }}
                              onKeyDown={e => { if (e.key === 'Enter' && col.readOnly) (e.target as HTMLInputElement).blur() }}
                              className={`w-full border rounded px-2 py-1 text-sm focus:outline-none bg-transparent focus:bg-white ${col.readOnly ? 'border-gray-200 focus:border-primary font-mono' : 'border-transparent focus:border-gray-200'} placeholder:text-text-muted`}
                            />
                          </td>
                        )
                      })}
                      <td className="px-3 py-1.5 sticky right-0 bg-gray-50/40" />
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'month' ? (
        /* ── Month grid ── */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {MONTH_PERIODS.map(p => {
            const count = ordersForMonth(p.key).length
            return (
              <button key={p.key} onClick={() => setSelectedPeriod(p.key)}
                className="bg-white border border-gray-100 rounded-xl px-5 py-4 text-left hover:border-primary hover:shadow-sm transition-all">
                <div className="text-base font-semibold text-text-primary">{p.label}</div>
                <div className="text-xs text-text-secondary mt-1">{count} order{count !== 1 ? 's' : ''}</div>
              </button>
            )
          })}
          {ordersUnassigned().length > 0 && (
            <button onClick={() => setSelectedPeriod('unassigned')}
              className="bg-white border border-gray-100 rounded-xl px-5 py-4 text-left hover:border-primary hover:shadow-sm transition-all">
              <div className="text-base font-semibold text-text-primary">Unassigned / 未分配</div>
              <div className="text-xs text-text-secondary mt-1">{ordersUnassigned().length} order{ordersUnassigned().length !== 1 ? 's' : ''}</div>
            </button>
          )}
        </div>
      ) : (
        /* ── Quarter grid ── */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {QUARTER_PERIODS.map(p => {
            const count = ordersForQuarter(p.key).length
            return (
              <button key={p.key} onClick={() => setSelectedPeriod(p.key)}
                className="bg-white border border-gray-100 rounded-xl px-5 py-4 text-left hover:border-primary hover:shadow-sm transition-all">
                <div className="text-base font-semibold text-text-primary">{p.label}</div>
                <div className="text-xs text-text-secondary mt-1">{count} order{count !== 1 ? 's' : ''}</div>
              </button>
            )
          })}
          {ordersUnassigned().length > 0 && (
            <button onClick={() => setSelectedPeriod('unassigned')}
              className="bg-white border border-gray-100 rounded-xl px-5 py-4 text-left hover:border-primary hover:shadow-sm transition-all">
              <div className="text-base font-semibold text-text-primary">Unassigned / 未分配</div>
              <div className="text-xs text-text-secondary mt-1">{ordersUnassigned().length} order{ordersUnassigned().length !== 1 ? 's' : ''}</div>
            </button>
          )}
        </div>
      )}

      {/* Form modal — create only */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-lg font-bold mb-6">New Order / 新建订单</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Container No. / 货柜号 <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.container_number}
                  onChange={e => setForm(f => ({ ...f, container_number: e.target.value }))}
                  required placeholder="e.g. C-2025-001"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              {selectedPeriod && selectedPeriod !== 'unassigned' && (
                <div className="col-span-2 bg-gray-50 rounded-lg px-4 py-3">
                  <div className="text-xs font-medium text-text-secondary mb-2">Period Assignment / 归属时间</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-text-secondary mb-1">Quarter / 季度</div>
                      <div className="text-sm text-text-primary font-medium">{form.belonged_quarter || '—'}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">
                        Month / 月份{viewMode === 'quarter' && <span className="text-red-500 ml-0.5">*</span>}
                      </label>
                      {viewMode === 'quarter' ? (
                        <select value={form.belonged_month}
                          onChange={e => setForm(f => ({ ...f, belonged_month: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                          <option value="">— Select month / 选择月份 —</option>
                          {quarterMonthOptions.map(m => (
                            <option key={m.key} value={m.key}>{m.label}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-sm text-text-primary font-medium">{form.belonged_month || '—'}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {editableFields.map(([key, label]) => (
                <div key={key} className={key === 'remarks' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-text-secondary mb-1">{label}</label>
                  {key === 'remarks' ? (
                    <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  ) : (
                    <input
                      type={dateFields.includes(key) ? 'date' : numberFields.includes(key) ? 'number' : 'text'}
                      step={numberFields.includes(key) ? '0.0001' : undefined}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  )}
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Customer / 客户</label>
                <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">— None —</option>
                  {customers.map(c => <option key={c.user_id} value={c.user_id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Supplier / 供应商</label>
                <select value={form.supplier_id} onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">— None —</option>
                  {suppliers.map(s => <option key={s.user_id} value={s.user_id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Status / 状态</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              {error && <p className="col-span-2 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
              <div className="col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-text-secondary border border-gray-200 rounded-lg">Cancel / 取消</button>
                <button type="submit" className="px-4 py-2 text-sm bg-primary hover:bg-primary-hover text-white rounded-lg font-medium">Create / 创建</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
