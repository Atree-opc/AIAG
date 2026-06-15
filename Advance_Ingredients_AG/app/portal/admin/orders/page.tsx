'use client'

import { useEffect, useRef, useState } from 'react'
import { Order, User } from '@/types'
import FileManager from '@/components/FileManager'
import ExcelImport from '@/components/ExcelImport'

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

const EMPTY_FORM = {
  container_number: '', contract_id: '', customer_id: '', supplier_id: '', bl: '',
  brand: '', product: '', price: '', quantity: '', quantity_unit: 'MT',
  loading_date: '', etd: '', ship_on_board_date: '', eta: '',
  batch_no: '', production_date: '', df_invoice_no: '', df_ai_price: '',
  freight_forwarder: '', freight_forwarder_method: '', lc_number: '', port_of_loading: '', port_of_discharge: '',
  status: 'pending', remarks: '',
  is_organic: 'false', tc_contract_no: '', tc_invoice_no: '', tc_seller: '', tc_buyer: '',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [error, setError] = useState('')
  const [customers, setCustomers] = useState<User[]>([])
  const [suppliers, setSuppliers] = useState<User[]>([])
  const savedForm = useRef({ ...EMPTY_FORM })
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm.current)

  function handleClose() {
    if (isDirty && !confirm('You have unsaved changes. Discard them? / 有未保存的更改，确认放弃？')) return
    setShowForm(false)
  }

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

  function openEdit(order: Order) {
    setEditOrder(order)
    setForm({
      container_number: order.container_number,
      contract_id: order.contract_id ?? '',
      customer_id: order.customer_id ?? '',
      supplier_id: order.supplier_id ?? '',
      bl: order.bl ?? '',
      brand: order.brand ?? '',
      product: order.product ?? '',
      price: order.price?.toString() ?? '',
      quantity: order.quantity?.toString() ?? '',
      quantity_unit: order.quantity_unit ?? 'MT',
      loading_date: order.loading_date?.slice(0, 10) ?? '',
      etd: order.etd?.slice(0, 10) ?? '',
      ship_on_board_date: order.ship_on_board_date?.slice(0, 10) ?? '',
      eta: order.eta?.slice(0, 10) ?? '',
      batch_no: order.batch_no ?? '',
      production_date: order.production_date?.slice(0, 10) ?? '',
      df_invoice_no: order.df_invoice_no ?? '',
      df_ai_price: order.df_ai_price?.toString() ?? '',
      freight_forwarder: order.freight_forwarder ?? '',
      freight_forwarder_method: order.freight_forwarder_method ?? '',
      lc_number: order.lc_number ?? '',
      port_of_loading: order.port_of_loading ?? '',
      port_of_discharge: order.port_of_discharge ?? '',
      status: order.status ?? 'pending',
      remarks: order.remarks ?? '',
      is_organic: order.is_organic ? 'true' : 'false',
      tc_contract_no: order.tc_contract_no ?? '',
      tc_invoice_no: order.tc_invoice_no ?? '',
      tc_seller: order.tc_seller ?? '',
      tc_buyer: order.tc_buyer ?? '',
    })
    setShowForm(true)
    setError('')
    savedForm.current = {
      container_number: order.container_number,
      contract_id: order.contract_id ?? '',
      customer_id: order.customer_id ?? '',
      supplier_id: order.supplier_id ?? '',
      bl: order.bl ?? '',
      brand: order.brand ?? '',
      product: order.product ?? '',
      price: order.price?.toString() ?? '',
      quantity: order.quantity?.toString() ?? '',
      quantity_unit: order.quantity_unit ?? 'MT',
      loading_date: order.loading_date?.slice(0, 10) ?? '',
      etd: order.etd?.slice(0, 10) ?? '',
      ship_on_board_date: order.ship_on_board_date?.slice(0, 10) ?? '',
      eta: order.eta?.slice(0, 10) ?? '',
      batch_no: order.batch_no ?? '',
      production_date: order.production_date?.slice(0, 10) ?? '',
      df_invoice_no: order.df_invoice_no ?? '',
      df_ai_price: order.df_ai_price?.toString() ?? '',
      freight_forwarder: order.freight_forwarder ?? '',
      freight_forwarder_method: order.freight_forwarder_method ?? '',
      lc_number: order.lc_number ?? '',
      port_of_loading: order.port_of_loading ?? '',
      port_of_discharge: order.port_of_discharge ?? '',
      status: order.status ?? 'pending',
      remarks: order.remarks ?? '',
      is_organic: order.is_organic ? 'true' : 'false',
      tc_contract_no: order.tc_contract_no ?? '',
      tc_invoice_no: order.tc_invoice_no ?? '',
      tc_seller: order.tc_seller ?? '',
      tc_buyer: order.tc_buyer ?? '',
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const body = {
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      quantity: form.quantity ? parseFloat(form.quantity) : null,
      df_ai_price: form.df_ai_price ? parseFloat(form.df_ai_price) : null,
      customer_id: form.customer_id || null,
      is_organic: form.is_organic === 'true',
    }
    const res = await fetch(`/api/orders/${editOrder!.container_number}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Error'); return }
    setShowForm(false)
    fetchOrders()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this order? / 确认删除此订单？')) return
    await fetch(`/api/orders/${id}`, { method: 'DELETE', headers: authHeaders() })
    fetchOrders()
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
    ['is_organic', 'Is Organic / 是否有机产品'],
    ['tc_contract_no', 'TC Contract No. / 有机销售证用合同号'],
    ['tc_invoice_no', 'TC Invoice No. / 有机销售证用发票号'],
    ['tc_seller', 'TC Seller / 有机销售证卖方'],
    ['tc_buyer', 'TC Buyer / 有机销售证买方'],
    ['remarks', 'Container # / 航运货柜号'],
  ] as const

  const dateFields = ['loading_date', 'etd', 'ship_on_board_date', 'eta', 'production_date']
  const numberFields = ['price', 'quantity', 'df_ai_price']

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Orders / 订单管理</h1>
        <p className="text-sm text-text-secondary mt-0.5">{orders.length} orders total</p>
      </div>

      <div className="mb-4">
        <ExcelImport onImportComplete={() => {
          fetchOrders()
        }} />
      </div>

      {loading ? (
        <p className="text-text-secondary text-sm">Loading... / 加载中...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-max">
            <thead>
              <tr className="border-b border-gray-100 text-text-secondary text-xs">
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Container / 货柜号</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Contract / 合同</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">B/L / 提单号</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Brand / 品牌</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Product / 产品</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Price €/kg / 单价</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Quantity / 数量</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Unit / 单位</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Loading Date / 提货日</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">ETD / 预计离港</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">On Board / 真实离港</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">ETA / 预计到港</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Batch No. / 批次号</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Production Date / 生产日期</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">DF Invoice No.</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">DF-AI Price / 进价</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Freight/Forwarder / 货代</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Freight Method / 货运方式</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">L/C Number / 信用证号</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Port of Loading / 装货港</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Port of Discharge / 卸货港</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Is Organic / 是否有机</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">TC Contract No. / 有机合同号</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">TC Invoice No. / 有机发票号</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">TC Seller / 有机卖方</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">TC Buyer / 有机买方</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Status / 状态</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Container # / 航运货柜号</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap sticky right-0 bg-white">Actions / 操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={29} className="px-4 py-8 text-center text-text-muted">No orders / 暂无订单</td></tr>
              )}
              {orders.map(order => (
                <tr key={order.container_number} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 font-mono text-xs font-semibold whitespace-nowrap">{order.container_number}</td>
                  <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{order.contract_id ?? '—'}</td>
                  <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{order.bl ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{order.brand ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{order.product ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.price ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.quantity ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.quantity_unit ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.loading_date?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.etd?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.ship_on_board_date?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.eta?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.batch_no ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.production_date?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.df_invoice_no ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.df_ai_price ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{order.freight_forwarder ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{order.freight_forwarder_method ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.lc_number ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{order.port_of_loading ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{order.port_of_discharge ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.is_organic ? 'Yes / 是' : 'No / 否'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.tc_contract_no ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.tc_invoice_no ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{order.tc_seller ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{order.tc_buyer ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-text-secondary">
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs max-w-xs truncate" title={order.remarks ?? ''}>{order.remarks ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap sticky right-0 bg-white">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(order)} className="text-xs text-blue-600 hover:underline">Edit/编辑</button>
                      <button onClick={() => handleDelete(order.container_number)} className="text-xs text-red-500 hover:underline">Delete/删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={handleClose}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Edit Order / 编辑订单</h2>
              <button type="button" onClick={handleClose} className="text-text-muted hover:text-text-primary text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

              <div className="col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">Container No. / 货柜号</label>
                <input
                  type="text"
                  value={form.container_number}
                  disabled
                  className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-text-muted cursor-not-allowed"
                />
              </div>

              {editableFields.map(([key, label]) => (
                <div key={key} className={key === 'remarks' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-text-secondary mb-1">{label}</label>
                  {key === 'remarks' ? (
                    <textarea
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : key === 'is_organic' ? (
                    <select
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="false">No / 否</option>
                      <option value="true">Yes / 是</option>
                    </select>
                  ) : (
                    <input
                      type={dateFields.includes(key) ? 'date' : numberFields.includes(key) ? 'number' : 'text'}
                      step={numberFields.includes(key) ? '0.0001' : undefined}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                </div>
              ))}

              {/* Customer dropdown */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Customer / 客户</label>
                <select
                  value={form.customer_id}
                  onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">— None —</option>
                  {customers.map(c => (
                    <option key={c.user_id} value={c.user_id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Supplier dropdown */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Supplier / 供应商</label>
                <select
                  value={form.supplier_id}
                  onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">— None —</option>
                  {suppliers.map(s => (
                    <option key={s.user_id} value={s.user_id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Status / 状态</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              {error && <p className="col-span-2 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}

              <div className="col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={handleClose} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-gray-200 rounded-lg">
                  Cancel / 取消
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-primary hover:bg-primary-hover text-white rounded-lg font-medium">Save / 保存</button>
              </div>
            </form>
            {editOrder && (
              <FileManager containerNumber={editOrder.container_number} canUpload={true} canDelete={true} userRole="admin" />
            )}
          </div>
        </div>
      )}

    </div>
  )
}
