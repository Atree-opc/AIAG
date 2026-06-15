'use client'

import { useEffect, useRef, useState } from 'react'
import { FileChecklistStatus, OrderFile, OrderFileChecklistItem } from '@/types'
import { Role } from '@/types'
import { FILE_CATEGORY_TEMPLATES } from '@/lib/file-checklist-config'
import { postFormDataWithProgress, UploadPhase } from '@/lib/upload-with-progress'

function jsonHeaders() {
  return { 'Content-Type': 'application/json' }
}

interface Props {
  containerNumber: string
  canUpload: boolean
  canDelete: boolean
  userRole: Role
}

type FileRow = OrderFile & { uploaded_by_name?: string }

type Folder = 'admin' | 'supplier' | 'customer' | 'accountant'

const CHECKLIST_STATUS_LABELS: Record<FileChecklistStatus, string> = {
  missing: 'Missing / 缺失',
  uploaded: 'Uploaded / 已上传',
  reviewing: 'Reviewing / 待审核',
  approved: 'Approved / 已确认',
  rejected: 'Rejected / 需重传',
}

function formatSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileManager({ containerNumber, canUpload, canDelete, userRole }: Props) {
  const [files, setFiles] = useState<FileRow[]>([])
  const [checklist, setChecklist] = useState<OrderFileChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('uploading')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [activeFolder, setActiveFolder] = useState<Folder>('admin')
  const [uploadCategory, setUploadCategory] = useState('uncategorized')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canManageChecklist = userRole === 'admin' || userRole === 'staff'
  const canManageVisibility = userRole === 'staff'
  const canSeeTabs = userRole === 'staff' || userRole === 'admin'

  async function fetchFiles() {
    setLoading(true)
    const res = await fetch(`/api/files/${containerNumber}`)
    const data = await res.json()
    if (Array.isArray(data)) {
      setFiles(data)
      setChecklist([])
    } else {
      setFiles(Array.isArray(data.files) ? data.files : [])
      setChecklist(Array.isArray(data.checklist) ? data.checklist : [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchFiles() }, [containerNumber])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files ?? [])
    if (selectedFiles.length === 0) return
    setError('')
    setMessage('')
    setUploading(true)
    setUploadProgress(0)
    setUploadPhase('uploading')
    const form = new FormData()
    selectedFiles.forEach(file => form.append('files', file))
    form.append('category_code', uploadCategory)
    try {
      const { ok, data } = await postFormDataWithProgress<{
        error?: string
        uploaded?: unknown[]
        failed?: Array<{ filename?: string; error?: string }>
      }>(
        `/api/files/${containerNumber}`,
        form,
        progress => {
          setUploadPhase(progress.phase)
          setUploadProgress(progress.percent)
        }
      )

      if (!ok) {
        setError(data.error ?? 'Upload failed')
      } else {
        const uploadedCount = Array.isArray(data.uploaded) ? data.uploaded.length : 0
        const failedUploads = Array.isArray(data.failed) ? data.failed : []
        if (uploadedCount > 0) {
          setMessage(
            failedUploads.length > 0
              ? `Uploaded ${uploadedCount} file(s), ${failedUploads.length} failed. / 已上传 ${uploadedCount} 个文件，失败 ${failedUploads.length} 个。`
              : `Uploaded ${uploadedCount} file(s). / 已上传 ${uploadedCount} 个文件。`
          )
        }
        if (failedUploads.length > 0) {
          setError(failedUploads.map(item => `${item.filename ?? 'Unknown file'}: ${item.error ?? 'Upload failed'}`).join(' '))
        }
        await fetchFiles()
      }
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setUploadPhase('uploading')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function openCategoryUpload(categoryCode: string) {
    setUploadCategory(categoryCode)
    fileInputRef.current?.click()
  }

  async function updateChecklist(categoryCode: string, payload: { status?: FileChecklistStatus; note?: string }) {
    const res = await fetch(`/api/files/${containerNumber}/__checklist__`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ category_code: categoryCode, ...payload }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Checklist update failed')
      return
    }

    const updated = await res.json()
    setChecklist(items => items.map(item => item.category_code === categoryCode ? { ...item, ...updated } : item))
  }

  async function handleDelete(fileId: string, filename: string) {
    if (!confirm(`Delete "${filename}"?`)) return
    const res = await fetch(`/api/files/${containerNumber}/${fileId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setFiles(f => f.filter(x => x.file_id !== fileId))
    } else {
      const data = await res.json()
      setError(data.error ?? 'Delete failed')
    }
  }

  async function handleCategoryChange(fileId: string, categoryCode: string) {
    const res = await fetch(`/api/files/${containerNumber}/${fileId}`, {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify({ category_code: categoryCode }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Category update failed')
      return
    }

    await fetchFiles()
  }

  async function handleDownload(fileId: string, filename: string) {
    const res = await fetch(`/api/files/${containerNumber}/${fileId}`)
    if (!res.ok) { setError('Download failed'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  async function toggleVisibility(fileId: string, field: 'visible_to_customer' | 'visible_to_supplier' | 'visible_to_accountant', current: boolean) {
    const res = await fetch(`/api/files/${containerNumber}/${fileId}`, {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify({ [field]: !current }),
    })
    if (res.ok) {
      const updated = await res.json()
      setFiles(fs => fs.map(f => f.file_id === fileId ? { ...f, ...updated } : f))
    } else {
      const data = await res.json()
      setError(data.error ?? 'Update failed')
    }
  }

  // For staff/admin: filter by active folder tab
  function folderFiles(folder: Folder): FileRow[] {
    if (folder === 'admin') return files
    if (folder === 'supplier') return files.filter(f => f.visible_to_supplier)
    if (folder === 'customer') return files.filter(f => f.visible_to_customer)
    return files.filter(f => f.visible_to_accountant)
  }

  const displayFiles = canSeeTabs ? folderFiles(activeFolder) : files

  const FOLDERS: { key: Folder; label: string; count: number }[] = [
    { key: 'admin',      label: 'All / 全部',        count: files.length },
    { key: 'supplier',   label: 'Supplier / 供应商',  count: files.filter(f => f.visible_to_supplier).length },
    { key: 'customer',   label: 'Customer / 客户',    count: files.filter(f => f.visible_to_customer).length },
    { key: 'accountant', label: 'Finance / 财务',     count: files.filter(f => f.visible_to_accountant).length },
  ]

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary">Files / 文件</h3>
        <div className="flex items-center gap-2">
          {canUpload && (
            <>
              <select
                value={uploadCategory}
                onChange={e => setUploadCategory(e.target.value)}
                disabled={uploading}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
              >
                {FILE_CATEGORY_TEMPLATES.map(category => (
                  <option key={category.code} value={category.code}>
                    {category.label_en} / {category.label_zh}
                  </option>
                ))}
              </select>
              <label className={`text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${uploading ? 'bg-gray-100 text-text-muted' : 'bg-primary hover:bg-primary-hover text-white'}`}>
                {uploading ? (uploadPhase === 'uploading' ? `Uploading ${uploadProgress}%...` : 'Processing...') : '+ Upload / 上传'}
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </>
          )}
        </div>
      </div>

      {message && <p className="text-xs text-green-700 bg-green-50 rounded px-3 py-1.5 mb-3">{message}</p>}
      {error && <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-1.5 mb-3">{error}</p>}
      {uploading && (
        <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
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
                        : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {item.label_en} / {item.label_zh}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {item.file_count} file(s){item.required ? ' · Required / 必需' : ' · Optional / 可选'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {canManageChecklist ? (
                    <select
                      value={item.status}
                      onChange={e => updateChecklist(item.category_code, { status: e.target.value as FileChecklistStatus })}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                    >
                      {Object.entries(CHECKLIST_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-text-secondary">
                      {CHECKLIST_STATUS_LABELS[item.status]}
                    </span>
                  )}
                  {canUpload && (
                    <button
                      type="button"
                      onClick={() => openCategoryUpload(item.category_code)}
                      disabled={uploading}
                      className="text-xs px-2 py-1 rounded-lg border border-primary/20 text-primary hover:bg-primary/5 disabled:opacity-50"
                    >
                      Upload / 上传
                    </button>
                  )}
                </div>
              </div>
              {canManageChecklist ? (
                <input
                  defaultValue={item.note ?? ''}
                  onBlur={e => {
                    const nextNote = e.target.value.trim()
                    if (nextNote !== (item.note ?? '')) {
                      updateChecklist(item.category_code, { note: nextNote })
                    }
                  }}
                  placeholder="Checklist note / 清单备注"
                  className="mt-3 w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                />
              ) : item.note ? (
                <p className="mt-3 text-xs text-text-secondary">{item.note}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Folder tabs — admin and staff only */}
      {canSeeTabs && (
        <div className="flex gap-1 mb-3">
          {FOLDERS.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveFolder(key)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                activeFolder === key
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-gray-200 hover:border-gray-300'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-xs text-text-muted">Loading... / 加载中...</p>
      ) : displayFiles.length === 0 ? (
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
                {canManageVisibility && <th className="text-center px-3 py-2 font-medium">Supplier</th>}
                {canManageVisibility && <th className="text-center px-3 py-2 font-medium">Customer</th>}
                {canManageVisibility && <th className="text-center px-3 py-2 font-medium">Finance</th>}
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {displayFiles.map(f => (
                <tr key={f.file_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-2 max-w-[180px] truncate" title={f.filename}>{f.filename}</td>
                  <td className="px-3 py-2 text-text-secondary">{formatSize(f.file_size)}</td>
                  <td className="px-3 py-2 text-text-secondary">
                    {canManageChecklist ? (
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
                    ) : (
                      <span>{f.category_label_en ?? f.category_code}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-text-secondary">{f.uploaded_by_name ?? '—'}</td>
                  <td className="px-3 py-2 text-text-secondary">{f.uploaded_at?.slice(0, 10)}</td>
                  {canManageVisibility && (
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={f.visible_to_supplier}
                        onChange={() => toggleVisibility(f.file_id, 'visible_to_supplier', f.visible_to_supplier)}
                        className="cursor-pointer"
                      />
                    </td>
                  )}
                  {canManageVisibility && (
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={f.visible_to_customer}
                        onChange={() => toggleVisibility(f.file_id, 'visible_to_customer', f.visible_to_customer)}
                        className="cursor-pointer"
                      />
                    </td>
                  )}
                  {canManageVisibility && (
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={f.visible_to_accountant}
                        onChange={() => toggleVisibility(f.file_id, 'visible_to_accountant', f.visible_to_accountant)}
                        className="cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="px-3 py-2 flex gap-2 justify-end">
                    <button onClick={() => handleDownload(f.file_id, f.filename)} className="text-blue-600 hover:underline">
                      Download / 下载
                    </button>
                    {canDelete && (
                      <button onClick={() => handleDelete(f.file_id, f.filename)} className="text-red-500 hover:underline">
                        Delete / 删除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
