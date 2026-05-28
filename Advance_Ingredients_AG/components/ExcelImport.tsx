'use client'

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'

interface ImportError {
  row: number
  container_number: string
  error: string
}

interface ImportResult {
  total: number
  success: number
  failed: number
  results: Array<{ index: number; container_number: string; success: boolean; error?: string }>
}

interface ExcelImportProps {
  onImportComplete?: (successCount: number, failCount: number) => void
  defaultBelongedMonth?: string | null
  defaultBelongedQuarter?: string | null
}

export default function ExcelImport({
  onImportComplete,
  defaultBelongedMonth,
  defaultBelongedQuarter,
}: ExcelImportProps) {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      // Read Excel file
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array', cellDates: true })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
        raw: false,
        dateNF: 'yyyy-mm-dd',
      })

      // Send to API
      const res = await fetch('/api/orders/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orders: jsonData,
          defaultBelongedMonth,
          defaultBelongedQuarter,
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Import failed')
      }

      const dataResult: ImportResult = await res.json()
      setResult(dataResult)

      if (onImportComplete) {
        onImportComplete(dataResult.success, dataResult.failed)
      }

    } catch (err) {
      console.error('Import error:', err)
      alert(err instanceof Error ? err.message : 'Failed to import orders')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const downloadTemplate = () => {
    // Create template with headers
    const template = [
      {
        'container_number': 'EXAMPLE001',
        'contract_id': '',
        'customer_id': '',
        'supplier_id': '',
        'bl': '',
        'brand': '',
        'product': '',
        'price': '',
        'quantity': '',
        'quantity_unit': 'MT',
        'loading_date': '2024-01-01',
        'etd': '2024-01-05',
        'ship_on_board_date': '2024-01-06',
        'eta': '2024-01-15',
        'batch_no': '',
        'production_date': '2024-01-01',
        'df_invoice_no': '',
        'df_ai_price': '',
        'freight_forwarder': '',
        'freight_forwarder_method': '',
        'lc_number': '',
        'port_of_loading': '',
        'port_of_discharge': '',
        'status': 'pending',
        'remarks': '',
        'parity': '',
        'packing': '',
        'payment_terms': '',
        'origin': '',
        'shelf_life': '',
        'invoice_no': '',
        'lc_issue_date': '2024-01-01',
        'lc_bank_name': '',
        'lc_bank_bic': '',
        'lc_bank_address': '',
        'buyer_name': '',
        'buyer_address': '',
        'is_organic': 'false',
        'tc_contract_no': '',
        'tc_invoice_no': '',
        'tc_seller': '',
        'tc_buyer': ''
      }
    ]

    const worksheet = XLSX.utils.json_to_sheet(template)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders')
    XLSX.writeFile(workbook, 'orders_import_template.xlsx')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="excel-upload"
        />
        <label
          htmlFor="excel-upload"
          className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
            uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {uploading ? 'Importing... / 导入中...' : 'Upload Excel / 上传 Excel'}
        </label>

        <button
          onClick={downloadTemplate}
          className="px-4 py-2 rounded-lg font-medium text-primary border border-primary hover:bg-primary/10 transition-colors"
        >
          Download Template / 下载模板
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg ${result.failed > 0 ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="font-medium mb-2">
            Import Result / 导入结果:
          </div>
          <div className="text-sm space-y-1">
            <div>Total / 总计: {result.total}</div>
            <div className="text-green-600">Success / 成功: {result.success}</div>
            {result.failed > 0 && (
              <div className="text-red-600">Failed / 失败: {result.failed}</div>
            )}
          </div>

          {result.failed > 0 && result.results.filter(r => !r.success).length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium text-red-600">
                View Errors / 查看错误 ({result.results.filter(r => !r.success).length})
              </summary>
              <div className="mt-2 max-h-40 overflow-y-auto text-xs">
                {result.results
                  .filter(r => !r.success)
                  .map((r, i) => (
                    <div key={i} className="py-1 border-b border-red-100 last:border-0">
                      Row {r.index + 1} ({r.container_number}): {r.error}
                    </div>
                  ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
