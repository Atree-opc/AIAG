'use client'

import { Fragment, useEffect, useState } from 'react'
import { OrderOption } from '@/types'

function authHeaders() {
  return { 'Content-Type': 'application/json' }
}

const ALL_FIELDS: { key: string; label: string }[] = [
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
  { key: 'invoice_no',         label: 'Invoice No.' },
  { key: 'parity',             label: 'Parity' },
  { key: 'payment_terms',      label: 'Payment Terms' },
  { key: 'packing',            label: 'Packing' },
  { key: 'origin',             label: 'Origin' },
  { key: 'shelf_life',         label: 'Shelf Life' },
  { key: 'lc_issue_date',      label: 'L/C Issue Date / 开证日期' },
  { key: 'lc_bank_name',       label: 'L/C Bank Name / 开证行' },
  { key: 'lc_bank_bic',        label: 'L/C Bank BIC' },
  { key: 'lc_bank_address',    label: 'L/C Bank Address / 开证行地址' },
  { key: 'buyer_name',         label: 'Buyer Company Name / 买方公司名称' },
  { key: 'buyer_address',      label: 'Buyer Address / 买方地址' },
  { key: 'is_organic',         label: 'Is Organic / 是否有机产品' },
  { key: 'tc_contract_no',     label: 'TC Contract No. / 有机销售证用合同号' },
  { key: 'tc_invoice_no',      label: 'TC Invoice No. / 有机销售证用发票号' },
  { key: 'tc_seller',          label: 'TC Seller / 有机销售证卖方' },
  { key: 'tc_buyer',           label: 'TC Buyer / 有机销售证买方' },
]

const CONFIGURABLE_ROLES = ['staff', 'accountant']

type Perm = { visible: boolean; editable: boolean }
type PermsState = Record<string, Record<string, Perm>>

function emptyPerms(): PermsState {
  const s: PermsState = {}
  for (const role of CONFIGURABLE_ROLES) {
    s[role] = {}
    for (const f of ALL_FIELDS) s[role][f.key] = { visible: false, editable: false }
  }
  return s
}

export default function AdminSettingsPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Settings / 设置</h1>
        <p className="text-sm text-text-secondary mt-0.5">System-level controls / 系统级设置</p>
      </div>

      <div className="space-y-6">
        <RolePermissionsSection />
        <HardDeniedSection />
        <OrderOptionsSection />
      </div>
    </div>
  )
}

function RolePermissionsSection() {
  const [perms, setPerms] = useState<PermsState>(emptyPerms())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const roleResults = await Promise.all(
        CONFIGURABLE_ROLES.map(async role => {
          const res = await fetch(`/api/role-fields?role=${role}`, { headers: authHeaders() })
          const data = await res.json()
          return { role, fields: Array.isArray(data.fields) ? data.fields : [] }
        })
      )
      const state = emptyPerms()
      for (const { role, fields } of roleResults as { role: string; fields: { field_key: string; editable: boolean }[] }[]) {
        for (const f of fields) {
          const key = typeof f === 'string' ? f : f.field_key
          const editable = typeof f === 'string' ? false : (f.editable ?? false)
          if (state[role][key] !== undefined) {
            state[role][key] = { visible: true, editable }
          }
        }
      }
      setPerms(state)
      setLoading(false)
    }
    load()
  }, [])

  function toggle(role: string, key: string, prop: 'visible' | 'editable') {
    setPerms(prev => {
      const cur = prev[role][key]
      let next: Perm
      if (prop === 'visible') {
        next = { visible: !cur.visible, editable: !cur.visible ? cur.editable : false }
      } else {
        next = { visible: true, editable: !cur.editable }
      }
      return { ...prev, [role]: { ...prev[role], [key]: next } }
    })
  }

  async function handleSave() {
    setSaving(true)
    await Promise.all(
      CONFIGURABLE_ROLES.map(role => {
        const fields = ALL_FIELDS
          .filter(f => perms[role][f.key].visible)
          .map(f => ({ field_key: f.key, editable: perms[role][f.key].editable }))
        return fetch('/api/role-fields', {
          method: 'PUT', headers: authHeaders(),
          body: JSON.stringify({ role, fields }),
        })
      })
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <p className="text-sm text-text-secondary">Loading permissions... / 加载权限中...</p>

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Role Field Permissions / 角色字段权限</h2>
          <p className="text-xs text-text-secondary mt-0.5">Configure field visibility and editability for Staff and Accountant / 配置Staff和Accountant的字段可见性与编辑权限</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="text-sm px-4 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-60">
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save All / 保存'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 font-medium text-text-secondary w-48">Field / 字段</th>
              {CONFIGURABLE_ROLES.map(role => (
                <th key={role} colSpan={2} className="text-center py-2 px-2 font-semibold text-text-primary capitalize border-l border-gray-100">
                  {role}
                </th>
              ))}
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="py-1.5 pr-4"></th>
              {CONFIGURABLE_ROLES.map(role => (
                <Fragment key={role}>
                  <th key={`${role}-v`} className="py-1.5 px-3 text-center font-medium text-text-secondary border-l border-gray-100">Visible</th>
                  <th key={`${role}-e`} className="py-1.5 px-3 text-center font-medium text-text-secondary">Editable</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_FIELDS.map(({ key, label }) => (
              <tr key={key} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2 pr-4 font-medium text-text-primary">{label}</td>
                {CONFIGURABLE_ROLES.map(role => {
                  const p = perms[role][key]
                  return (
                    <Fragment key={`${key}-${role}`}>
                      <td key={`${role}-v`} className="py-2 px-3 text-center border-l border-gray-100">
                        <input type="checkbox" checked={p.visible}
                          onChange={() => toggle(role, key, 'visible')}
                          className="w-4 h-4 accent-primary cursor-pointer" />
                      </td>
                      <td key={`${role}-e`} className="py-2 px-3 text-center">
                        <input type="checkbox" checked={p.editable} disabled={!p.visible}
                          onChange={() => toggle(role, key, 'editable')}
                          className="w-4 h-4 accent-primary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" />
                      </td>
                    </Fragment>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function HardDeniedSection() {
  const [hardDenied, setHardDenied] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/hard-denied', { headers: authHeaders() })
      .then(r => r.json())
      .then(data => {
        setHardDenied(new Set(Array.isArray(data.fields) ? data.fields : []))
        setLoading(false)
      })
  }, [])

  function toggle(key: string) {
    const next = new Set(hardDenied)
    if (next.has(key)) next.delete(key); else next.add(key)
    setHardDenied(next)
  }

  async function handleSave() {
    setSaving(true)
    await fetch('/api/hard-denied', {
      method: 'PUT', headers: authHeaders(),
      body: JSON.stringify({ fields: Array.from(hardDenied) }),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return null

  return (
    <div className="bg-white rounded-2xl border border-red-100 p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-red-700">Hard-Denied Fields / 字段黑名单</h2>
        <button onClick={handleSave} disabled={saving}
          className="text-sm px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60">
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save / 保存'}
        </button>
      </div>
      <p className="text-xs text-text-secondary mb-4">
        Checked fields cannot be made visible to any role. Existing visibility will be removed on save. / 勾选的字段对所有角色强制不可见，保存时会清除已有的可见权限。
      </p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
        {ALL_FIELDS.map(({ key, label }) => (
          <label key={key} className={`flex items-center gap-2.5 text-xs cursor-pointer rounded-lg px-2 py-1.5 ${hardDenied.has(key) ? 'bg-red-50 text-red-700 font-medium' : 'text-text-primary hover:bg-gray-50'}`}>
            <input type="checkbox" checked={hardDenied.has(key)} onChange={() => toggle(key)}
              className="w-4 h-4 accent-red-600 cursor-pointer" />
            {label}
          </label>
        ))}
      </div>
    </div>
  )
}

const OPTION_TYPES = [
  { type: 'parity', label: 'Parity Options' },
  { type: 'payment_terms', label: 'Payment Terms Options' },
]

function OrderOptionsSection() {
  const [options, setOptions] = useState<OrderOption[]>([])
  const [loading, setLoading] = useState(true)
  const [newValues, setNewValues] = useState<Record<string, string>>({ parity: '', payment_terms: '' })
  const [adding, setAdding] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/order-options', { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setOptions(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  async function handleAdd(type: string) {
    const value = newValues[type]?.trim()
    if (!value) return
    setAdding(type); setError('')
    const res = await fetch('/api/order-options', {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ option_type: type, value, sort_order: options.filter(o => o.option_type === type).length + 1 }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed'); setAdding(null); return }
    setOptions(prev => [...prev, data])
    setNewValues(prev => ({ ...prev, [type]: '' }))
    setAdding(null)
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/order-options/${id}`, { method: 'DELETE', headers: authHeaders() })
    if (res.ok) setOptions(prev => prev.filter(o => o.option_id !== id))
  }

  if (loading) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-text-primary mb-1">Dropdown Options / 下拉选项</h2>
      <p className="text-xs text-text-secondary mb-4">Manage selectable values for Parity and Payment Terms / 管理 Parity 和付款方式的可选值</p>
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
      <div className="grid grid-cols-2 gap-6">
        {OPTION_TYPES.map(({ type, label }) => (
          <div key={type}>
            <h3 className="text-sm font-medium text-text-primary mb-2">{label}</h3>
            <ul className="space-y-1 mb-3">
              {options.filter(o => o.option_type === type).map(o => (
                <li key={o.option_id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-text-primary">{o.value}</span>
                  <button onClick={() => handleDelete(o.option_id)} className="text-red-400 hover:text-red-600 ml-2">✕</button>
                </li>
              ))}
              {options.filter(o => o.option_type === type).length === 0 && (
                <li className="text-xs text-text-muted italic">No options yet</li>
              )}
            </ul>
            <div className="flex gap-2">
              <input
                value={newValues[type]}
                onChange={e => setNewValues(prev => ({ ...prev, [type]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAdd(type)}
                placeholder="Add new option..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
              />
              <button onClick={() => handleAdd(type)} disabled={adding === type || !newValues[type]?.trim()}
                className="text-xs px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg disabled:opacity-50">
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
