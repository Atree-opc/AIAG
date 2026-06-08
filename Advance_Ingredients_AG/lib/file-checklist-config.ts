export const FILE_CATEGORY_TEMPLATES = [
  { code: 'contract', label_en: 'Contract', label_zh: '合同', sort_order: 1, required: true },
  { code: 'invoice', label_en: 'Invoice', label_zh: '发票', sort_order: 2, required: true },
  { code: 'bill_of_exchange', label_en: 'Bill of Exchange', label_zh: '汇票', sort_order: 3, required: true },
  { code: 'ippc', label_en: 'IPPC', label_zh: 'IPPC', sort_order: 4, required: true },
  { code: 'scanned_copy', label_en: 'Scanned Copy', label_zh: '扫描件', sort_order: 5, required: true },
  { code: 'lc', label_en: 'L/C', label_zh: '信用证', sort_order: 6, required: true },
  { code: 'uncategorized', label_en: 'Uncategorized', label_zh: '未分类', sort_order: 99, required: false },
] as const

export const FILE_CHECKLIST_STATUSES = ['missing', 'uploaded', 'reviewing', 'approved', 'rejected'] as const
