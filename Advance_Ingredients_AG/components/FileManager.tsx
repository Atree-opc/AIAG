'use client'

import { useEffect, useRef, useState } from 'react'
import { OrderFile } from '@/types'
import { Role } from '@/types'

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

function formatSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileManager({ containerNumber, canUpload, canDelete, userRole }: Props) {
  const [files, setFiles] = useState<FileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [activeFolder, setActiveFolder] = useState<Folder>('admin')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isStaff = userRole === 'staff'
  const canSeeTabs = userRole === 'staff' || userRole === 'admin'

  async function fetchFiles() {
    setLoading(true)
    const res = await fetch(`/api/files/${containerNumber}`)
    const data = await res.json()
    setFiles(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchFiles() }, [containerNumber])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`/api/files/${containerNumber}`, {
      method: 'POST',
      body: form,
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Upload failed')
    } else {
      await fetchFiles()
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
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
        {canUpload && (
          <label className={`text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${uploading ? 'bg-gray-100 text-text-muted' : 'bg-primary hover:bg-primary-hover text-white'}`}>
            {uploading ? 'Uploading...' : '+ Upload / 上传'}
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-1.5 mb-3">{error}</p>}

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
                <th className="text-left px-3 py-2 font-medium">Uploaded by / 上传者</th>
                <th className="text-left px-3 py-2 font-medium">Date / 日期</th>
                {isStaff && <th className="text-center px-3 py-2 font-medium">Supplier</th>}
                {isStaff && <th className="text-center px-3 py-2 font-medium">Customer</th>}
                {isStaff && <th className="text-center px-3 py-2 font-medium">Finance</th>}
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {displayFiles.map(f => (
                <tr key={f.file_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-2 max-w-[180px] truncate" title={f.filename}>{f.filename}</td>
                  <td className="px-3 py-2 text-text-secondary">{formatSize(f.file_size)}</td>
                  <td className="px-3 py-2 text-text-secondary">{f.uploaded_by_name ?? '—'}</td>
                  <td className="px-3 py-2 text-text-secondary">{f.uploaded_at?.slice(0, 10)}</td>
                  {isStaff && (
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={f.visible_to_supplier}
                        onChange={() => toggleVisibility(f.file_id, 'visible_to_supplier', f.visible_to_supplier)}
                        className="cursor-pointer"
                      />
                    </td>
                  )}
                  {isStaff && (
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={f.visible_to_customer}
                        onChange={() => toggleVisibility(f.file_id, 'visible_to_customer', f.visible_to_customer)}
                        className="cursor-pointer"
                      />
                    </td>
                  )}
                  {isStaff && (
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
