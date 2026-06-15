import { Order } from '@/types'

const SELLER = {
  name: 'Advanced Ingredients AG',
  address: 'Mühlenstrasse 26',
  city: '8200 Schaffhausen',
  country: 'Switzerland',
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
  // Simple integer + cents approach
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
  if (int >= 1000000) { result += below1000(Math.floor(int / 1000000)) + 'MILLION '; }
  if (int >= 1000) { result += below1000(Math.floor((int % 1000000) / 1000)) + 'THOUSAND '; }
  result += below1000(int % 1000)
  result = result.trim()
  if (cents > 0) result += ` AND CENTS ${cents}/100`
  return result + ' ONLY'
}

export function buildInvoiceHtml(order: Order, customerName: string): string {
  const total = (order.price ?? 0) * (order.quantity ?? 0)
  const unit = order.quantity_unit ?? 'MT'
  const totalWords = toWords(total)

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 10pt; color: #000; }
  .page { padding: 0; }
  h1 { font-size: 20pt; font-weight: bold; text-align: center; letter-spacing: 4px; margin-bottom: 16px; }
  table.info { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  table.info td { padding: 2px 4px; vertical-align: top; }
  table.info td.label { font-weight: bold; width: 140px; white-space: nowrap; }
  .divider { border-top: 2px solid #000; margin: 8px 0; }
  .divider-thin { border-top: 1px solid #000; margin: 6px 0; }
  table.goods { width: 100%; border-collapse: collapse; margin: 10px 0; }
  table.goods th { border: 1px solid #000; padding: 4px 6px; background: #f0f0f0; font-size: 9pt; text-align: center; }
  table.goods td { border: 1px solid #000; padding: 4px 6px; font-size: 9pt; }
  table.goods td.right { text-align: right; }
  table.goods td.center { text-align: center; }
  .total-row td { font-weight: bold; background: #f8f8f8; }
  .section-label { font-weight: bold; margin-top: 8px; }
  .two-col { display: flex; gap: 20px; }
  .two-col > div { flex: 1; }
  .words { font-style: italic; margin-top: 4px; font-size: 9pt; }
  .bank-box { border: 1px solid #ccc; padding: 8px; margin-top: 8px; font-size: 9pt; }
  .bank-box .bank-label { font-weight: bold; margin-bottom: 4px; }
  .sig-area { margin-top: 40px; display: flex; justify-content: flex-end; }
  .sig-box { text-align: center; width: 200px; }
  .sig-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 4px; font-size: 9pt; }
</style>
</head>
<body>
<div class="page">
  <h1>INVOICE</h1>

  <div class="two-col">
    <div>
      <div class="section-label">SELLER / 卖方</div>
      <div>${SELLER.name}</div>
      <div>${SELLER.address}</div>
      <div>${SELLER.city}, ${SELLER.country}</div>
    </div>
    <div>
      <table class="info">
        <tr><td class="label">Invoice No.:</td><td>${order.invoice_no ?? '—'}</td></tr>
        <tr><td class="label">Date:</td><td>${fmtDate(order.ship_on_board_date)}</td></tr>
        <tr><td class="label">Contract No.:</td><td>${order.contract_id ?? '—'}</td></tr>
        <tr><td class="label">L/C No.:</td><td>${order.lc_number ?? '—'}</td></tr>
        <tr><td class="label">L/C Issue Date:</td><td>${fmtDate(order.lc_issue_date)}</td></tr>
      </table>
    </div>
  </div>

  <div class="divider"></div>

  <div class="section-label">BUYER / 买方</div>
  <div>${customerName}</div>

  <div class="divider-thin"></div>

  <table class="goods">
    <thead>
      <tr>
        <th>Description of Goods</th>
        <th>Brand</th>
        <th>Origin</th>
        <th>Quantity</th>
        <th>Unit Price (EUR/kg)</th>
        <th>Amount (EUR)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${order.product ?? '—'}</td>
        <td class="center">${order.brand ?? '—'}</td>
        <td class="center">${order.origin ?? '—'}</td>
        <td class="center">${fmt(order.quantity)} ${unit}</td>
        <td class="right">EUR ${fmt(order.price, 4)}/kg</td>
        <td class="right">EUR ${fmt(total)}</td>
      </tr>
      <tr class="total-row">
        <td colspan="5" class="right">TOTAL:</td>
        <td class="right">EUR ${fmt(total)}</td>
      </tr>
    </tbody>
  </table>

  <div class="words">SAY TOTAL: EURO ${totalWords}</div>

  <div class="divider-thin"></div>

  <table class="info" style="margin-top:8px">
    <tr><td class="label">Parity:</td><td>${order.parity ?? '—'}</td></tr>
    <tr><td class="label">Packing:</td><td>${order.packing ?? '—'}</td></tr>
    <tr><td class="label">Shelf Life:</td><td>${order.shelf_life ?? '—'}</td></tr>
    <tr><td class="label">Payment Terms:</td><td>${order.payment_terms ?? '—'}</td></tr>
  </table>

  ${order.lc_bank_name ? `
  <div class="bank-box">
    <div class="bank-label">BANK DETAILS / 开证行信息</div>
    <div>${order.lc_bank_name}</div>
    ${order.lc_bank_bic ? `<div>BIC/SWIFT: ${order.lc_bank_bic}</div>` : ''}
    ${order.lc_bank_address ? `<div>${order.lc_bank_address}</div>` : ''}
  </div>` : ''}

  <div class="sig-area">
    <div class="sig-box">
      <div class="sig-line">${SELLER.name}</div>
    </div>
  </div>
</div>
</body>
</html>`
}
