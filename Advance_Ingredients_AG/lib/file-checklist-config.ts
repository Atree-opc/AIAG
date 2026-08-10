export const FILE_CATEGORY_TEMPLATES = [
  { code: 'contract', label_en: 'Contract', label_zh: '合同', sort_order: 1, required: true },
  { code: 'invoice', label_en: 'Invoice', label_zh: '发票', sort_order: 2, required: true },
  { code: 'df_invoice', label_en: 'DF Invoice', label_zh: 'DF发票', sort_order: 3, required: true },
  { code: 'bill_of_exchange', label_en: 'Bill of Exchange', label_zh: '汇票', sort_order: 4, required: true },
  { code: 'ippc', label_en: 'IPPC', label_zh: 'IPPC', sort_order: 5, required: true },
  { code: 'scanned_copy', label_en: 'Scanned Copy', label_zh: '扫描件', sort_order: 6, required: true },
  { code: 'lc', label_en: 'L/C', label_zh: '信用证', sort_order: 7, required: true },
  { code: 'lc_payment_fee_proof', label_en: 'L/C Payment Proof & Fees', label_zh: '信用证付款证明与手续费', sort_order: 8, required: false },
  { code: 'uncategorized', label_en: 'Uncategorized', label_zh: '未分类', sort_order: 99, required: false },
] as const

export const FILE_CHECKLIST_STATUSES = ['missing', 'uploaded', 'reviewing', 'approved', 'rejected'] as const

export const FILE_CATEGORY_APPEARANCE: Record<string, {
  panel: string
  header: string
  badge: string
  dot: string
}> = {
  contract: {
    panel: 'border-sky-200 bg-sky-50/70',
    header: 'bg-sky-100/80',
    badge: 'border-sky-200 bg-sky-100 text-sky-700',
    dot: 'bg-sky-500',
  },
  invoice: {
    panel: 'border-emerald-200 bg-emerald-50/70',
    header: 'bg-emerald-100/80',
    badge: 'border-emerald-200 bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  df_invoice: {
    panel: 'border-teal-200 bg-teal-50/70',
    header: 'bg-teal-100/80',
    badge: 'border-teal-200 bg-teal-100 text-teal-700',
    dot: 'bg-teal-500',
  },
  bill_of_exchange: {
    panel: 'border-violet-200 bg-violet-50/70',
    header: 'bg-violet-100/80',
    badge: 'border-violet-200 bg-violet-100 text-violet-700',
    dot: 'bg-violet-500',
  },
  ippc: {
    panel: 'border-cyan-200 bg-cyan-50/70',
    header: 'bg-cyan-100/80',
    badge: 'border-cyan-200 bg-cyan-100 text-cyan-700',
    dot: 'bg-cyan-500',
  },
  scanned_copy: {
    panel: 'border-amber-200 bg-amber-50/70',
    header: 'bg-amber-100/80',
    badge: 'border-amber-200 bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  lc: {
    panel: 'border-rose-200 bg-rose-50/70',
    header: 'bg-rose-100/80',
    badge: 'border-rose-200 bg-rose-100 text-rose-700',
    dot: 'bg-rose-500',
  },
  lc_payment_fee_proof: {
    panel: 'border-fuchsia-200 bg-fuchsia-50/70',
    header: 'bg-fuchsia-100/80',
    badge: 'border-fuchsia-200 bg-fuchsia-100 text-fuchsia-700',
    dot: 'bg-fuchsia-500',
  },
  uncategorized: {
    panel: 'border-slate-200 bg-slate-50/70',
    header: 'bg-slate-100/80',
    badge: 'border-slate-200 bg-slate-100 text-slate-700',
    dot: 'bg-slate-500',
  },
}
