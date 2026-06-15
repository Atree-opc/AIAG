'use client'

import { useEffect, useState } from 'react'
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
  for (let i = 0; i < 18; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    periods.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` })
  }
  return periods
}

const PERIODS = generatePeriods()

export default function AccountantFinancePage() {
  const [year, setYear] = useState(PERIODS[0].year)
  const [month, setMonth] = useState(PERIODS[0].month)
  const [files, setFiles] = useState<AccountantFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  async function handleDownload(fileId: string, filename: string) {
    const res = await fetch(`/api/accountant-files/${year}/${month}/${fileId}`)
    if (!res.ok) { setError('Download failed'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const currentLabel = MONTHS[month - 1] + ' ' + year

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Finance Files / 财务文件</h1>
        <p className="text-sm text-text-secondary mt-0.5">Download files / 下载文件</p>
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

        {/* File list */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-text-primary mb-4">{currentLabel}</h2>

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
                    <th className="text-left py-2 pr-4 font-medium">Uploaded / 上传时间</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(f => (
                    <tr key={f.file_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="py-2 pr-4 text-text-primary">{f.filename}</td>
                      <td className="py-2 pr-4 text-text-secondary">{formatSize(f.file_size)}</td>
                      <td className="py-2 pr-4 text-text-secondary">{f.uploaded_at?.slice(0, 10)}</td>
                      <td className="py-2">
                        <button
                          onClick={() => handleDownload(f.file_id, f.filename)}
                          className="text-xs text-primary hover:underline"
                        >
                          Download / 下载
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
