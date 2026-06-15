import { Order } from '@/types'

const SELLER = {
  name: 'Advanced Ingredients AG',
  address: 'Mühlenstrasse 26, 8200 Schaffhausen, Switzerland',
}

function fmt(n: number | null | undefined, decimals = 2) {
  if (n == null) return '—'
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return String(d).slice(0, 10)
}

function toWords(amount: number): string {
  const ones = ['','ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE',
    'TEN','ELEVEN','TWELVE','THIRTEEN','FOURTEEN','FIFTEEN','SIXTEEN','SEVENTEEN','EIGHTEEN','NINETEEN']
  const tens = ['','','TWENTY','THIRTY','FORTY','FIFTY','SIXTY','SEVENTY','EIGHTY','NINETY']

  function below1000(n: number): string {
    if (n === 0) return ''
    if (n < 20) return ones[n] + ' '
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '') + ' '
    return ones[Math.floor(n / 100)] + ' HUNDRED ' + below1000(n % 100)
  }

  const int = Math.floor(amount)
  const cents = Math.round((amount - int) * 100)
  let result = ''
  if (int >= 1000000) result += below1000(Math.floor(int / 1000000)) + 'MILLION '
  if (int >= 1000) result += below1000(Math.floor((int % 1000000) / 1000)) + 'THOUSAND '
  result += below1000(int % 1000)
  result = result.trim()
  if (cents > 0) result += ` AND CENTS ${cents}/100`
  return result + ' ONLY'
}

export function buildBillOfExchangeHtml(order: Order, customerName: string): string {
  const total = (order.price ?? 0) * (order.quantity ?? 0)
  const totalWords = toWords(total)

  // Payment tenor from payment_terms, e.g. "L/C 90 days after B/L date" → "90 DAYS AFTER B/L DATE"
  const tenor = order.payment_terms
    ? order.payment_terms.replace(/^L\/C\s*/i, '').toUpperCase()
    : 'AT SIGHT'

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 10pt; color: #000; }
  h1 { font-size: 18pt; font-weight: bold; text-align: center; letter-spacing: 6px; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 9pt; }
  .meta-item { }
  .meta-item .label { font-weight: bold; }
  .amount-box { border: 2px solid #000; padding: 10px 16px; text-align: center; margin-bottom: 20px; }
  .amount-box .amount-num { font-size: 16pt; font-weight: bold; }
  .amount-box .amount-words { font-size: 9pt; margin-top: 4px; font-style: italic; }
  .body-text { line-height: 1.8; margin-bottom: 20px; font-size: 10pt; }
  .body-text strong { font-weight: bold; }
  table.info { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  table.info td { padding: 3px 6px; vertical-align: top; }
  table.info td.label { font-weight: bold; width: 160px; white-space: nowrap; }
  .divider { border-top: 1px solid #000; margin: 12px 0; }
  .sig-area { margin-top: 50px; display: flex; justify-content: flex-end; }
  .sig-box { text-align: center; width: 220px; }
  .sig-line { border-top: 1px solid #000; margin-top: 60px; padding-top: 4px; font-size: 9pt; }
  .no { font-size: 9pt; text-align: right; margin-bottom: 4px; }
</style>
</head>
<body>
  <div class="no">No.: ${order.lc_number ?? '—'}</div>
  <h1>BILL OF EXCHANGE</h1>

  <div class="meta">
    <div class="meta-item"><span class="label">Date: </span>${fmtDate(order.ship_on_board_date)}</div>
    <div class="meta-item"><span class="label">Place: </span>Schaffhausen, Switzerland</div>
  </div>

  <div class="amount-box">
    <div class="amount-num">EUR ${fmt(total)}</div>
    <div class="amount-words">SAY: EURO ${totalWords}</div>
  </div>

  <div class="body-text">
    <strong>${tenor}</strong> of this FIRST Bill of Exchange (Second of the same tenor and date being unpaid),
    Pay to the order of <strong>${SELLER.name}</strong> the sum of
    <strong>EURO ${fmt(total)} (${totalWords})</strong>
    under Letter of Credit No. <strong>${order.lc_number ?? '—'}</strong>
    issued by <strong>${order.lc_bank_name ?? '—'}</strong>
    on <strong>${fmtDate(order.lc_issue_date)}</strong>
    for account of <strong>${customerName}</strong>.
  </div>

  <div class="divider"></div>

  <table class="info">
    <tr><td class="label">Invoice No.:</td><td>${order.invoice_no ?? '—'}</td></tr>
    <tr><td class="label">Contract No.:</td><td>${order.contract_id ?? '—'}</td></tr>
    <tr><td class="label">Goods:</td><td>${order.product ?? '—'} (${order.brand ?? '—'})</td></tr>
    <tr><td class="label">Quantity:</td><td>${fmt(order.quantity)} ${order.quantity_unit ?? 'MT'}</td></tr>
    <tr><td class="label">Parity:</td><td>${order.parity ?? '—'}</td></tr>
  </table>

  <div class="divider"></div>

  <p style="font-size:9pt; margin-bottom:8px;"><strong>TO:</strong></p>
  <p style="font-size:9pt;">${order.lc_bank_name ?? '—'}</p>
  ${order.lc_bank_bic ? `<p style="font-size:9pt;">BIC/SWIFT: ${order.lc_bank_bic}</p>` : ''}
  ${order.lc_bank_address ? `<p style="font-size:9pt;">${order.lc_bank_address}</p>` : ''}

  <div class="sig-area">
    <div class="sig-box">
      <div class="sig-line">${SELLER.name}<br/>${SELLER.address}</div>
    </div>
  </div>
</body>
</html>`
}
