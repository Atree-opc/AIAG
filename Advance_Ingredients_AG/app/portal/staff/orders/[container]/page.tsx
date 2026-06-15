'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { FileChecklistStatus, Order, OrderFile, OrderFileChecklistItem, OrderOption, User } from '@/types'
import { FILE_CATEGORY_TEMPLATES } from '@/lib/file-checklist-config'
import { postFormDataWithProgress, UploadPhase } from '@/lib/upload-with-progress'

type FileRow = OrderFile & { uploaded_by_name?: string }

const CHECKLIST_STATUS_LABELS: Record<FileChecklistStatus, string> = {
  missing: 'Missing / 缺失',
  uploaded: 'Uploaded / 已上传',
  reviewing: 'Reviewing / 待审核',
  approved: 'Approved / 已确认',
  rejected: 'Rejected / 需重传',
}

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

const DATE_FIELDS = new Set(['loading_date','etd','ship_on_board_date','eta','production_date','lc_issue_date'])
const NUMBER_FIELDS = new Set(['price','quantity','df_ai_price'])

const ORDER_FIELDS: { key: keyof Order; label: string }[] = [
  { key: 'container_number',   label: 'Container No. / 货柜号' },
  { key: 'contract_id',        label: 'Contract ID / 合同号' },
  { key: 'brand',              label: 'Brand / 品牌' },
  { key: 'product',            label: 'Product / 产品' },
  { key: 'bl',                 label: 'B/L / 提单号' },
  { key: 'price',              label: 'Price €/kg / 单价' },
  { key: 'quantity',           label: 'Quantity / 数量' },
  { key: 'quantity_unit',      label: 'Unit / 单位' },
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
  { key: 'customer_id',        label: 'Customer / 客户' },
  { key: 'remarks',            label: 'Container # / 航运货柜号' },
]

const INVOICE_FIELDS: { key: keyof Order; label: string }[] = [
  { key: 'invoice_no',      label: 'Invoice No.' },
  { key: 'parity',          label: 'Parity' },
  { key: 'payment_terms',   label: 'Payment Terms' },
  { key: 'packing',         label: 'Packing' },
  { key: 'origin',          label: 'Origin' },
  { key: 'shelf_life',      label: 'Shelf Life' },
  { key: 'lc_issue_date',   label: 'L/C Issue Date / 开证日期' },
  { key: 'lc_bank_name',    label: 'L/C Bank Name / 开证行' },
  { key: 'lc_bank_bic',     label: 'L/C Bank BIC' },
  { key: 'lc_bank_address', label: 'L/C Bank Address / 开证行地址' },
  { key: 'buyer_name',      label: 'Buyer Company Name / 买方公司名称' },
  { key: 'buyer_address',   label: 'Buyer Address / 买方地址' },
]

const ORGANIC_FIELDS: { key: keyof Order; label: string }[] = [
  { key: 'is_organic',      label: 'Is Organic / 是否有机产品' },
  { key: 'tc_contract_no',  label: 'TC Contract No. / 有机销售证用合同号' },
  { key: 'tc_invoice_no',   label: 'TC Invoice No. / 有机销售证用发票号' },
  { key: 'tc_seller',       label: 'TC Seller / 有机销售证卖方' },
  { key: 'tc_buyer',        label: 'TC Buyer / 有机销售证买方' },
]

function formatSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function OrderDetailInner() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const container = params.container as string

  const [order, setOrder] = useState<Order | null>(null)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [editingField, setEditingField] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [customers, setCustomers] = useState<User[]>([])
  const [orderOptions, setOrderOptions] = useState<OrderOption[]>([])

  const [files, setFiles] = useState<FileRow[]>([])
  const [checklist, setChecklist] = useState<OrderFileChecklistItem[]>([])
  const [filesLoading, setFilesLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('uploading')
  const [uploadError, setUploadError] = useState('')
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadCategory, setUploadCategory] = useState('uncategorized')
  const [dragging, setDragging] = useState(false)
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const backHref = (() => {
    const period = searchParams.get('period')
    const mode = searchParams.get('mode')
    if (period && mode) return `/portal/staff/orders?period=${period}&mode=${mode}`
    return '/portal/staff/orders'
  })()

  useEffect(() => {
    fetch(`/api/orders/${container}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { if (data && !data.error) setOrder(data) })
    fetch('/api/users', { headers: authHeaders() })
      .then(r => r.json())
      .then(data => setCustomers((Array.isArray(data) ? data : []).filter((u: User) => u.role === 'customer')))
    fetch('/api/order-options', { headers: authHeaders() })
      .then(r => r.json())
      .then(data => setOrderOptions(Array.isArray(data) ? data : []))
    fetchFiles()
  }, [container])

  async function fetchFiles() {
    setFilesLoading(true)
    const res = await fetch(`/api/files/${container}`, { headers: authHeaders() })
    const data = await res.json()
    if (Array.isArray(data)) {
      setFiles(data)
      setChecklist([])
    } else {
      setFiles(Array.isArray(data.files) ? data.files : [])
      setChecklist(Array.isArray(data.checklist) ? data.checklist : [])
    }
    setFilesLoading(false)
  }

  function getDisplayValue(key: keyof Order): string {
    const raw = draft[key] !== undefined ? draft[key] : (order?.[key] ?? '')
    if (!raw && raw !== 0 && raw !== false) return '—'
    if (DATE_FIELDS.has(key)) return String(raw).slice(0, 10)
    if (key === 'status') return STATUS_LABELS[String(raw)] ?? String(raw)
    if (key === 'customer_id') return customers.find(c => c.user_id === raw)?.name ?? String(raw)
    if (key === 'is_organic') return raw === true || raw === 'true' ? 'Yes / 是' : 'No / 否'
    if (key === 'quantity' && order) {
      const unit = draft['quantity_unit'] ?? order.quantity_unit ?? 'MT'
      return `${raw} ${unit}`
    }
    return String(raw)
  }

  function getEditValue(key: keyof Order): string {
    if (draft[key] !== undefined) return draft[key]
    const v = order?.[key]
    if (v === null || v === undefined) return ''
    if (DATE_FIELDS.has(key)) return String(v).slice(0, 10)
    if (key === 'is_organic') return v === true ? 'true' : 'false'
    return String(v)
  }

  function commitField(key: string, value: string) {
    setDraft(d => ({ ...d, [key]: value }))
    setEditingField(null)
  }

  async function handleSave() {
    if (!order || Object.keys(draft).length === 0) return
    setSaving(true)
    setSaveError('')
    const body: Record<string, unknown> = { ...draft }
    if (draft.price !== undefined) body.price = draft.price ? parseFloat(draft.price) : null
    if (draft.quantity !== undefined) body.quantity = draft.quantity ? parseFloat(draft.quantity) : null
    if (draft.df_ai_price !== undefined) body.df_ai_price = draft.df_ai_price ? parseFloat(draft.df_ai_price) : null
    if (draft.customer_id !== undefined) body.customer_id = draft.customer_id || null

    const res = await fetch(`/api/orders/${container}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) { setSaveError(data.error ?? 'Save failed'); setSaving(false); return }
    setOrder(data)
    setDraft({})
    setSaving(false)
  }

  async function handleUploadFiles(fileList: FileList | File[]) {
    const filesToUpload = Array.from(fileList)
    if (filesToUpload.length === 0) return

    setShowUpload(true)
    setUploadError('')
    setUploadMessage('')
    setUploading(true)
    setUploadProgress(0)
    setUploadPhase('uploading')
    const form = new FormData()
    filesToUpload.forEach(file => form.append('files', file))
    form.append('category_code', uploadCategory)
    try {
      const { ok, data } = await postFormDataWithProgress<{
        error?: string
        uploaded?: unknown[]
        failed?: Array<{ filename?: string; error?: string }>
      }>(
        `/api/files/${container}`,
        form,
        progress => {
          setUploadPhase(progress.phase)
          setUploadProgress(progress.percent)
        }
      )

      if (!ok) {
        setUploadError(data.error ?? 'Upload failed')
      } else {
        const uploadedCount = Array.isArray(data.uploaded) ? data.uploaded.length : 0
        const failedUploads = Array.isArray(data.failed) ? data.failed : []
        if (uploadedCount > 0) {
          setUploadMessage(
            failedUploads.length > 0
              ? `Uploaded ${uploadedCount} file(s), ${failedUploads.length} failed. / 已上传 ${uploadedCount} 个文件，失败 ${failedUploads.length} 个。`
              : `Uploaded ${uploadedCount} file(s). / 已上传 ${uploadedCount} 个文件。`
          )
        }
        if (failedUploads.length > 0) {
          setUploadError(failedUploads.map(item => `${item.filename ?? 'Unknown file'}: ${item.error ?? 'Upload failed'}`).join(' '))
        }
        await fetchFiles()
      }
    } catch {
      setUploadError('Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setUploadPhase('uploading')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function openCategoryUpload(categoryCode: string) {
    setUploadCategory(categoryCode)
    setShowUpload(true)
    fileInputRef.current?.click()
  }

  async function handleDelete(fileId: string, filename: string) {
    if (!confirm(`Delete "${filename}"? / 确认删除？`)) return
    const res = await fetch(`/api/files/${container}/${fileId}`, {
      method: 'DELETE', headers: authHeaders(),
    })
    if (res.ok) await fetchFiles()
  }

  async function handleDownloadFile(fileId: string, filename: string) {
    const res = await fetch(`/api/files/${container}/${fileId}`, { headers: authHeaders() })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  async function handleDownloadAll() {
    const res = await fetch(`/api/files/${container}/download-all`, { headers: authHeaders() })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${container}-files.zip`; a.click()
    URL.revokeObjectURL(url)
  }

  async function handleRenameConfirm(fileId: string) {
    if (!renameValue.trim()) return
    const res = await fetch(`/api/files/${container}/${fileId}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ filename: renameValue.trim() }),
    })
    if (res.ok) {
      const updated = await res.json()
      setFiles(f => f.map(x => x.file_id === fileId ? { ...x, filename: updated.filename } : x))
    }
    setRenamingFile(null)
  }

  async function handleToggleVisibility(fileId: string, field: 'visible_to_supplier' | 'visible_to_customer', current: boolean) {
    const res = await fetch(`/api/files/${container}/${fileId}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ [field]: !current }),
    })
    if (res.ok) {
      const updated = await res.json()
      setFiles(fs => fs.map(f => f.file_id === fileId ? { ...f, ...updated } : f))
    }
  }

  async function handleCategoryChange(fileId: string, categoryCode: string) {
    const res = await fetch(`/api/files/${container}/${fileId}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ category_code: categoryCode }),
    })
    if (res.ok) {
      await fetchFiles()
    }
  }

  async function handleChecklistUpdate(categoryCode: string, payload: { status?: FileChecklistStatus; note?: string }) {
    const res = await fetch(`/api/files/${container}/__checklist__`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ category_code: categoryCode, ...payload }),
    })
    if (res.ok) {
      const updated = await res.json()
      setChecklist(items => items.map(item => item.category_code === categoryCode ? { ...item, ...updated } : item))
    }
  }

  const hasDraft = Object.keys(draft).length > 0

  if (!order) return <p className="text-sm text-text-secondary p-8">Loading... / 加载中...</p>

  return (
    <div className="max-w-5xl">
      {/* Breadcrumb + Save */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <button onClick={() => router.push(backHref)} className="hover:text-text-primary">Orders / 订单</button>
          <span>/</span>
          <span className="text-text-primary font-medium">{container}</span>
        </div>
        <div className="flex items-center gap-3">
          {saveError && <span className="text-xs text-red-600">{saveError}</span>}
          <button
            onClick={handleSave}
            disabled={!hasDraft || saving}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${hasDraft ? 'bg-primary hover:bg-primary-hover text-white' : 'bg-gray-100 text-text-muted cursor-not-allowed'}`}
          >
            {saving ? 'Saving...' : 'Save / 保存'}
          </button>
        </div>
      </div>

      {/* Order info card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">Order Info / 订单信息</h2>
          {hasDraft && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Unsaved changes / 有未保存的修改</span>}
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {ORDER_FIELDS.filter(f => f.key !== 'remarks').map(({ key, label }) => {
            const isEditing = editingField === key
            const isReadonly = key === 'container_number'
            return (
              <div key={key}>
                <div className="text-xs text-text-secondary mb-0.5">{label}</div>
                {isEditing ? (
                  <FieldInput
                    fieldKey={key}
                    value={getEditValue(key)}
                    customers={customers}
                    orderOptions={orderOptions}
                    onCommit={(v) => commitField(key, v)}
                    onCancel={() => setEditingField(null)}
                  />
                ) : (
                  <div
                    onDoubleClick={() => !isReadonly && setEditingField(key)}
                    className={`text-sm text-text-primary min-h-[1.5rem] rounded px-1 -mx-1 ${isReadonly ? '' : 'hover:bg-gray-50 cursor-text'} ${draft[key] !== undefined ? 'text-primary font-medium' : ''}`}
                    title={isReadonly ? '' : 'Double-click to edit / 双击编辑'}
                  >
                    {getDisplayValue(key) || <span className="text-text-muted">—</span>}
                  </div>
                )}
              </div>
            )
          })}
          {/* Remarks full width */}
          <div className="col-span-2">
            <div className="text-xs text-text-secondary mb-0.5">Container # / 航运货柜号</div>
            {editingField === 'remarks' ? (
              <FieldInput fieldKey="remarks" value={getEditValue('remarks')} customers={customers}
                orderOptions={orderOptions}
                onCommit={(v) => commitField('remarks', v)} onCancel={() => setEditingField(null)} />
            ) : (
              <div onDoubleClick={() => setEditingField('remarks')}
                className={`text-sm text-text-primary min-h-[1.5rem] rounded px-1 -mx-1 hover:bg-gray-50 cursor-text whitespace-pre-wrap ${draft['remarks'] !== undefined ? 'text-primary font-medium' : ''}`}>
                {getDisplayValue('remarks') || <span className="text-text-muted">—</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice / Document fields card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">Invoice & Document Fields / 发票字段</h2>
          <button
            onClick={async () => {
              const res = await fetch(`/api/generate/invoice/${container}`, { headers: authHeaders() })
              if (!res.ok) return alert('Generation failed')
              const blob = await res.blob()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a'); a.href = url
              a.download = `${container}-invoice.pdf`; a.click()
              URL.revokeObjectURL(url)
            }}
            className="text-sm px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
          >
            Generate Invoice PDF
          </button>
          <button
            onClick={async () => {
              const res = await fetch(`/api/generate/bill-of-exchange/${container}`, { headers: authHeaders() })
              if (!res.ok) return alert('Generation failed')
              const blob = await res.blob()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a'); a.href = url
              a.download = `${container}-bill-of-exchange.pdf`; a.click()
              URL.revokeObjectURL(url)
            }}
            className="text-sm px-3 py-1.5 border border-gray-200 hover:border-primary hover:text-primary text-text-secondary rounded-lg transition-colors"
          >
            Generate Bill of Exchange
          </button>
          <button
            onClick={async () => {
              const res = await fetch(`/api/generate/contract/${container}`, { headers: authHeaders() })
              if (!res.ok) return alert('Generation failed')
              const blob = await res.blob()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a'); a.href = url
              a.download = `${container}-contract.pdf`; a.click()
              URL.revokeObjectURL(url)
            }}
            className="text-sm px-3 py-1.5 border border-gray-200 hover:border-primary hover:text-primary text-text-secondary rounded-lg transition-colors"
          >
            Generate Contract
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {INVOICE_FIELDS.map(({ key, label }) => {
            const isEditing = editingField === key
            return (
              <div key={key} className={key === 'packing' || key === 'lc_bank_address' || key === 'buyer_address' ? 'col-span-2' : ''}>
                <div className="text-xs text-text-secondary mb-0.5">{label}</div>
                {isEditing ? (
                  <FieldInput
                    fieldKey={key}
                    value={getEditValue(key)}
                    customers={customers}
                    orderOptions={orderOptions}
                    onCommit={(v) => commitField(key, v)}
                    onCancel={() => setEditingField(null)}
                  />
                ) : (
                  <div
                    onDoubleClick={() => setEditingField(key)}
                    className={`text-sm text-text-primary min-h-[1.5rem] rounded px-1 -mx-1 hover:bg-gray-50 cursor-text ${draft[key] !== undefined ? 'text-primary font-medium' : ''}`}
                    title="Double-click to edit / 双击编辑"
                  >
                    {getDisplayValue(key) || <span className="text-text-muted">—</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Organic fields card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-text-primary mb-4">Organic Product Info / 有机产品信息</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {ORGANIC_FIELDS.map(({ key, label }) => {
            const isEditing = editingField === key
            return (
              <div key={key} className={key === 'is_organic' ? 'col-span-2' : ''}>
                <div className="text-xs text-text-secondary mb-0.5">{label}</div>
                {isEditing ? (
                  <FieldInput
                    fieldKey={key}
                    value={getEditValue(key)}
                    customers={customers}
                    orderOptions={orderOptions}
                    onCommit={(v) => commitField(key, v)}
                    onCancel={() => setEditingField(null)}
                  />
                ) : (
                  <div
                    onDoubleClick={() => setEditingField(key)}
                    className={`text-sm text-text-primary min-h-[1.5rem] rounded px-1 -mx-1 hover:bg-gray-50 cursor-text ${draft[key] !== undefined ? 'text-primary font-medium' : ''}`}
                    title="Double-click to edit / 双击编辑"
                  >
                    {getDisplayValue(key) || <span className="text-text-muted">—</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Files card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">Files / 文件 <span className="text-xs font-normal text-text-secondary ml-1">({files.length} total · {files.filter(f=>f.visible_to_supplier).length} supplier · {files.filter(f=>f.visible_to_customer).length} customer)</span></h2>
          <div className="flex items-center gap-2">
            <button onClick={() => { setShowUpload(v => !v); setUploadError('') }}
              className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-text-secondary hover:border-primary hover:text-primary transition-colors">
              {showUpload ? 'Cancel / 取消' : '+ Upload / 上传'}
            </button>
            <button onClick={handleDownloadAll} disabled={files.length === 0}
              className="text-sm px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Download All / 全部下载
            </button>
          </div>
        </div>

        {uploading && (
          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
            <div className="flex items-center justify-between gap-3 text-xs text-blue-800">
              <span>
                {uploadPhase === 'uploading'
                  ? `Uploading ${uploadProgress}% / 上传中 ${uploadProgress}%`
                  : 'Processing on server... / 服务器处理中...'}
              </span>
              <span>{uploadPhase === 'uploading' ? `${uploadProgress}%` : '100%'}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {checklist.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
            {checklist.map(item => (
              <div
                key={item.category_code}
                className={`border rounded-xl p-3 ${
                  item.status === 'missing'
                    ? 'border-red-200 bg-red-50/70'
                    : item.status === 'reviewing'
                      ? 'border-amber-200 bg-amber-50/70'
                      : item.status === 'rejected'
                        ? 'border-orange-200 bg-orange-50/70'
                        : item.status === 'approved'
                          ? 'border-green-200 bg-green-50/70'
                          : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.label_en} / {item.label_zh}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      {item.file_count} file(s){item.required ? ' · Required / 必需' : ' · Optional / 可选'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <select
                      value={item.status}
                      onChange={e => handleChecklistUpdate(item.category_code, { status: e.target.value as FileChecklistStatus })}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                    >
                      {Object.entries(CHECKLIST_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => openCategoryUpload(item.category_code)}
                      disabled={uploading}
                      className="text-xs px-2 py-1 rounded-lg border border-primary/20 text-primary hover:bg-primary/5 disabled:opacity-50"
                    >
                      Upload / 上传
                    </button>
                  </div>
                </div>
                <input
                  defaultValue={item.note ?? ''}
                  onBlur={e => {
                    const nextNote = e.target.value.trim()
                    if (nextNote !== (item.note ?? '')) {
                      handleChecklistUpdate(item.category_code, { note: nextNote })
                    }
                  }}
                  placeholder="Checklist note / 清单备注"
                  className="mt-3 w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                />
              </div>
            ))}
          </div>
        )}

        {/* Upload drop zone */}
        {showUpload && (
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault(); setDragging(false)
              if (e.dataTransfer.files.length > 0) handleUploadFiles(e.dataTransfer.files)
            }}
            className={`mb-4 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragging ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50'}`}
          >
            <p className="text-sm text-text-secondary mb-3">
              {uploading
                ? (uploadPhase === 'uploading'
                    ? `Uploading ${uploadProgress}%... / 上传中 ${uploadProgress}%...`
                    : 'Processing on server... / 服务器处理中...')
                : 'Drag & drop files here / 拖拽文件到此处'}
            </p>
            {!uploading && (
              <div className="mb-3 flex justify-center">
                <select
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
                >
                  {FILE_CATEGORY_TEMPLATES.map(category => (
                    <option key={category.code} value={category.code}>
                      {category.label_en} / {category.label_zh}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {!uploading && (
              <label className="text-sm text-primary hover:underline cursor-pointer">
                or browse / 或点击选择
                <input ref={fileInputRef} type="file" multiple className="hidden"
                  onChange={e => { if (e.target.files?.length) handleUploadFiles(e.target.files) }} />
              </label>
            )}
            {uploadMessage && <p className="text-xs text-green-700 mt-2">{uploadMessage}</p>}
            {uploadError && <p className="text-xs text-red-600 mt-2">{uploadError}</p>}
          </div>
        )}

        {/* File list */}
        {filesLoading ? (
          <p className="text-xs text-text-muted">Loading... / 加载中...</p>
        ) : files.length === 0 ? (
          <p className="text-xs text-text-muted">No files / 暂无文件</p>
        ) : (
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-text-secondary">
                  <th className="text-left px-3 py-2 font-medium">Filename / 文件名</th>
                  <th className="text-left px-3 py-2 font-medium">Size / 大小</th>
                  <th className="text-left px-3 py-2 font-medium">Category / 分类</th>
                  <th className="text-left px-3 py-2 font-medium">Uploaded by / 上传者</th>
                  <th className="text-left px-3 py-2 font-medium">Date / 日期</th>
                  <th className="text-center px-3 py-2 font-medium">Supplier</th>
                  <th className="text-center px-3 py-2 font-medium">Customer</th>
                  <th className="px-3 py-2 text-right font-medium">Actions / 操作</th>
                </tr>
              </thead>
              <tbody>
                {files.map(f => (
                  <tr key={f.file_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-3 py-2">
                      {renamingFile === f.file_id ? (
                        <div className="flex items-center gap-1">
                          <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleRenameConfirm(f.file_id); if (e.key === 'Escape') setRenamingFile(null) }}
                            className="border border-primary rounded px-2 py-0.5 text-xs w-48 focus:outline-none" />
                          <button onClick={() => handleRenameConfirm(f.file_id)} className="text-primary hover:underline">OK</button>
                          <button onClick={() => setRenamingFile(null)} className="text-text-muted hover:underline">✕</button>
                        </div>
                      ) : (
                        <span className="max-w-[200px] truncate block" title={f.filename}>{f.filename}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-text-secondary">{formatSize(f.file_size)}</td>
                    <td className="px-3 py-2">
                      <select
                        value={f.category_code ?? 'uncategorized'}
                        onChange={e => handleCategoryChange(f.file_id, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                      >
                        {FILE_CATEGORY_TEMPLATES.map(category => (
                          <option key={category.code} value={category.code}>
                            {category.label_en} / {category.label_zh}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-text-secondary">{f.uploaded_by_name ?? '—'}</td>
                    <td className="px-3 py-2 text-text-secondary">{f.uploaded_at?.slice(0, 10)}</td>
                    <td className="px-3 py-2 text-center">
                      <input type="checkbox" checked={f.visible_to_supplier}
                        onChange={() => handleToggleVisibility(f.file_id, 'visible_to_supplier', f.visible_to_supplier)}
                        className="cursor-pointer" />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input type="checkbox" checked={f.visible_to_customer}
                        onChange={() => handleToggleVisibility(f.file_id, 'visible_to_customer', f.visible_to_customer)}
                        className="cursor-pointer" />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3 justify-end">
                        <button onClick={() => handleDownloadFile(f.file_id, f.filename)} className="text-blue-600 hover:underline">Download</button>
                        <button onClick={() => { setRenamingFile(f.file_id); setRenameValue(f.filename) }} className="text-text-secondary hover:underline">Rename</button>
                        <button onClick={() => handleDelete(f.file_id, f.filename)} className="text-red-500 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<p className="text-sm text-text-secondary p-8">Loading... / 加载中...</p>}>
      <OrderDetailInner />
    </Suspense>
  )
}

function FieldInput({ fieldKey, value, customers, orderOptions, onCommit, onCancel }: {
  fieldKey: string
  value: string
  customers: User[]
  orderOptions: OrderOption[]
  onCommit: (v: string) => void
  onCancel: () => void
}) {
  const [val, setVal] = useState(value)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && fieldKey !== 'remarks') onCommit(val)
    if (e.key === 'Escape') onCancel()
  }

  if (fieldKey === 'parity' || fieldKey === 'payment_terms') {
    const opts = orderOptions.filter(o => o.option_type === fieldKey)
    return (
      <select autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={() => onCommit(val)}
        className="w-full border border-primary rounded px-2 py-1 text-sm focus:outline-none">
        <option value="">— None —</option>
        {opts.map(o => <option key={o.option_id} value={o.value}>{o.value}</option>)}
      </select>
    )
  }
  if (fieldKey === 'is_organic') {
    return (
      <select autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={() => onCommit(val)}
        className="w-full border border-primary rounded px-2 py-1 text-sm focus:outline-none">
        <option value="false">No / 否</option>
        <option value="true">Yes / 是</option>
      </select>
    )
  }
  if (fieldKey === 'status') {
    return (
      <select autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={() => onCommit(val)}
        className="w-full border border-primary rounded px-2 py-1 text-sm focus:outline-none">
        {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    )
  }
  if (fieldKey === 'customer_id') {
    return (
      <select autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={() => onCommit(val)}
        className="w-full border border-primary rounded px-2 py-1 text-sm focus:outline-none">
        <option value="">— None —</option>
        {customers.map(c => <option key={c.user_id} value={c.user_id}>{c.name}</option>)}
      </select>
    )
  }
  if (fieldKey === 'remarks') {
    return (
      <textarea autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={() => onCommit(val)}
        onKeyDown={handleKeyDown} rows={3}
        className="w-full border border-primary rounded px-2 py-1 text-sm focus:outline-none resize-none" />
    )
  }
  return (
    <input autoFocus
      type={DATE_FIELDS.has(fieldKey) ? 'date' : NUMBER_FIELDS.has(fieldKey) ? 'number' : 'text'}
      step={NUMBER_FIELDS.has(fieldKey) ? '0.0001' : undefined}
      value={val} onChange={e => setVal(e.target.value)}
      onBlur={() => onCommit(val)} onKeyDown={handleKeyDown}
      className="w-full border border-primary rounded px-2 py-1 text-sm focus:outline-none" />
  )
}
