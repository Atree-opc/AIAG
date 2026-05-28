'use client'

import { useEffect, useState } from 'react'

function authHeaders() {
  return { 'Content-Type': 'application/json' }
}

function HardDenyToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-600 text-white text-sm px-5 py-3 rounded-xl shadow-lg">
      <span>⚠️</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white/70 hover:text-white text-xs">✕</button>
    </div>
  )
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

const CONFIGURABLE_ROLES = ['customer', 'supplier']

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

export default function StaffSettingsPage() {
  const [perms, setPerms] = useState<PermsState>(emptyPerms())
  const [hardDenied, setHardDenied] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [warnMsg, setWarnMsg] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [deniedRes, ...roleResults] = await Promise.all([
        fetch('/api/hard-denied', { headers: authHeaders() }).then(r => r.json()),
        ...CONFIGURABLE_ROLES.map(async role => {
          const res = await fetch(`/api/role-fields?role=${role}`, { headers: authHeaders() })
          const data = await res.json()
          return { role, fields: Array.isArray(data.fields) ? data.fields : [] }
        })
      ])
      setHardDenied(new Set(Array.isArray(deniedRes.fields) ? deniedRes.fields : []))
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
    if (hardDenied.has(key)) {
      const label = ALL_FIELDS.find(f => f.key === key)?.label ?? key
      setWarnMsg(`"${label}" 已被列入黑名单，无法设置为可见 / This field is hard-denied and cannot be made visible.`)
      return
    }
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

  if (loading) return <p className="text-sm text-text-secondary">Loading... / 加载中...</p>

  return (
    <div className="max-w-5xl">
      {warnMsg && <HardDenyToast message={warnMsg} onClose={() => setWarnMsg(null)} />}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Settings / 设置</h1>
        <p className="text-sm text-text-secondary mt-0.5">Configure field visibility and editability for Customer and Supplier / 配置客户和供应商的字段可见性与编辑权限</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">Field Permissions / 字段权限</h2>
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
                  <>
                    <th key={`${role}-v`} className="py-1.5 px-3 text-center font-medium text-text-secondary border-l border-gray-100">Visible</th>
                    <th key={`${role}-e`} className="py-1.5 px-3 text-center font-medium text-text-secondary">Editable</th>
                  </>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_FIELDS.map(({ key, label }) => {
                const isDenied = hardDenied.has(key)
                return (
                  <tr key={key} className={`border-b border-gray-50 ${isDenied ? 'bg-red-50/60' : 'hover:bg-gray-50'}`}>
                    <td className="py-2 pr-4 font-medium flex items-center gap-1.5">
                      <span className={isDenied ? 'text-red-500' : 'text-text-primary'}>{label}</span>
                      {isDenied && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">DENIED</span>}
                    </td>
                    {CONFIGURABLE_ROLES.map(role => {
                      const p = perms[role][key]
                      return (
                        <>
                          <td key={`${role}-v`} className="py-2 px-3 text-center border-l border-gray-100">
                            <input type="checkbox" checked={p.visible && !isDenied}
                              onChange={() => toggle(role, key, 'visible')}
                              disabled={isDenied}
                              className="w-4 h-4 accent-primary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" />
                          </td>
                          <td key={`${role}-e`} className="py-2 px-3 text-center">
                            <input type="checkbox" checked={p.editable && !isDenied} disabled={!p.visible || isDenied}
                              onChange={() => toggle(role, key, 'editable')}
                              className="w-4 h-4 accent-primary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" />
                          </td>
                        </>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
