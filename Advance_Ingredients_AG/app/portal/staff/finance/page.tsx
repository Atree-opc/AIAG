'use client'

import { useEffect, useRef, useState } from 'react'
import { AccountantFile } from '@/types'

const MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
]

function formatSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function generatePeriods(): { year: number; month: number; label: string }[] {
  const now = new Date()
  const periods = []
  // Include next month for proactive uploads
  for (let i = -1; i < 18; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    periods.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` })
  }
  return periods
}

const PERIODS = generatePeriods()

export default function StaffFinancePage() {
  const [year, setYear] = useState(PERIODS[1].year)   // default = current month
  const [month, setMonth] = useState(PERIODS[1].month)
  const [files, setFiles] = useState<AccountantFile[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function fetchFiles(y: number, m: number) {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/accountant-files/${y}/${m}`)
    const data = await res.json()
    setFiles(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchFiles(year, month) }, [year, month])

  function selectPeriod(y: number, m: number) {
    setYear(y); setMonth(m)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`/api/accountant-files/${year}/${month}`, {
      method: 'POST',
      body: form,
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Upload failed')
    } else {
      setFiles(prev => [data, ...prev])
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDownload(fileId: string, filename: string) {
    const res = await fetch(`/api/accountant-files/${year}/${month}/${fileId}`)
    if (!res.ok) { setError('Download failed'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  async function handleDelete(fileId: string, filename: string) {
    if (!confirm(`Delete "${filename}"?`)) return
    const res = await fetch(`/api/accountant-files/${year}/${month}/${fileId}`, { method: 'DELETE' })
    if (res.ok) {
      setFiles(prev => prev.filter(f => f.file_id !== fileId))
    } else {
      const data = await res.json()
      setError(data.error ?? 'Delete failed')
    }
  }

  const currentLabel = MONTHS[month - 1] + ' ' + year

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Finance Files / 财务文件</h1>
        <p className="text-sm text-text-secondary mt-0.5">Internal documents for accountant access only / 财务专属文件，仅财务人员可下载</p>
      </div>

      <div className="flex gap-6">
        {/* Month selector */}
        <div className="w-44 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-3">
            <p className="text-xs font-medium text-text-secondary mb-2">Period / 期间</p>
            <div className="space-y-0.5">
              {PERIODS.map(p => (
                <button
                  key={`${p.year}-${p.month}`}
                  onClick={() => selectPeriod(p.year, p.month)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    year === p.year && month === p.month
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* File management */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-text-primary">{currentLabel}</h2>
              <label className={`text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${uploading ? 'bg-gray-100 text-text-muted' : 'bg-primary hover:bg-primary-hover text-white'}`}>
                {uploading ? 'Uploading...' : '+ Upload / 上传'}
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-1.5 mb-3">{error}</p>}

            {loading ? (
              <p className="text-sm text-text-muted">Loading... / 加载中...</p>
            ) : files.length === 0 ? (
              <p className="text-sm text-text-muted">No files for this period / 本月暂无财务文件</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-text-secondary text-xs">
                    <th className="text-left py-2 pr-4 font-medium">Filename / 文件名</th>
                    <th className="text-left py-2 pr-4 font-medium">Size / 大小</th>
                    <th className="text-left py-2 pr-4 font-medium">Uploaded by / 上传者</th>
                    <th className="text-left py-2 pr-4 font-medium">Date / 日期</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(f => (
                    <tr key={f.file_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="py-2 pr-4 text-text-primary">{f.filename}</td>
                      <td className="py-2 pr-4 text-text-secondary">{formatSize(f.file_size)}</td>
                      <td className="py-2 pr-4 text-text-secondary">{f.uploaded_by_name ?? '—'}</td>
                      <td className="py-2 pr-4 text-text-secondary">{f.uploaded_at?.slice(0, 10)}</td>
                      <td className="py-2 flex gap-2 justify-end">
                        <button onClick={() => handleDownload(f.file_id, f.filename)} className="text-xs text-primary hover:underline">
                          Download / 下载
                        </button>
                        <button onClick={() => handleDelete(f.file_id, f.filename)} className="text-xs text-red-500 hover:underline">
                          Delete / 删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
