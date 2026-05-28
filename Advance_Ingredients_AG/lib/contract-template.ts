import { Order } from '@/types'
import fs from 'fs'
import path from 'path'

const SELLER = {
  name: 'Advanced Ingredients AG',
  address: 'Mühlenstrasse 26',
  city: '8200 Schaffhausen',
  country: 'Switzerland',
}

const PUBLIC_DIR = path.join(process.cwd(), 'public')

function imgToBase64(filename: string): string | null {
  try {
    const filepath = path.join(PUBLIC_DIR, filename)
    const buf = fs.readFileSync(filepath)
    const ext = path.extname(filename).slice(1).toLowerCase()
    const mime = ext === 'jpg' ? 'image/jpeg' : ext === 'svg' ? 'image/svg+xml' : `image/${ext}`
    return `data:${mime};base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}

function getBrandLogo(brand: string | null): string | null {
  if (!brand) return null
  const b = brand.toUpperCase()
  if (b.includes('FOONEXUS')) return imgToBase64('FOONEXUS.png')
  if (b.includes('NEULINK'))  return imgToBase64('NEULINK.png')
  if (b.includes('LVEO'))     return imgToBase64('LVEO.png')
  return null
}

function fmt(n: number | null | undefined, decimals = 2) {
  if (n == null) return '—'
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

// Auto-derive packing from product name
function derivePacking(product: string | null, manualPacking: string | null): string {
  if (manualPacking) return manualPacking
  if (!product) return '25.00 kg multilayer paper bags with PE-inliner, New heat treated One-Way-Pallets 1000×1200'
  const p = product.toLowerCase()
  const kgPerBag = (p.includes('wpc') || p.includes('wph')) ? '20.00' : '25.00'
  return `${kgPerBag} kg multilayer paper bags with PE-inliner, New heat treated One-Way-Pallets 1000×1200`
}

// Shipment text: within 30 days after L/C
function deriveShipment(today: Date): string {
  const latest = new Date(today.getFullYear(), today.getMonth() + 3, 0)
  const latestStr = latest.toISOString().slice(0, 10)
  return `Within 30 days after opening L/C. Latest shipment ${latestStr}. Exact shipping details will be confirmed before loading.`
}

export function buildContractHtml(order: Order): string {
  const today = new Date()
  const contractDate = order.created_at ? fmtDate(new Date(order.created_at)) : '—'

  const total = (order.price ?? 0) * (order.quantity ?? 0)
  const unit = order.quantity_unit ?? 'MT'
  const packing = derivePacking(order.product, order.packing)
  const shipment = deriveShipment(today)

  const buyerName = order.buyer_name ?? '—'
  const buyerAddress = order.buyer_address ?? '—'

  const brandLogo = getBrandLogo(order.brand)
  const sealImg = imgToBase64('AIAG_seal&sign.png')

  const logoHtml = brandLogo
    ? `<img src="${brandLogo}" style="height:64px; max-width:200px; object-fit:contain;" />`
    : `<div style="font-size:11pt; font-weight:bold; color:#333;">${order.brand ?? ''}</div>`

  const sealHtml = sealImg
    ? `<img src="${sealImg}" style="height:110px; object-fit:contain; margin-top:8px; opacity:0.92;" />`
    : ''

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 10pt; color: #000; line-height: 1.5; }
  .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 18px; }
  .header-logo { min-width: 200px; }
  .header-title { text-align: center; flex: 1; padding: 0 20px; }
  h1 { font-size: 16pt; font-weight: bold; letter-spacing: 4px; margin-bottom: 4px; }
  h2 { font-size: 11pt; font-weight: bold; color: #444; margin-bottom: 6px; }
  .ref { font-size: 9pt; color: #333; }
  .ref strong { color: #000; }
  .parties { display: flex; gap: 30px; margin-bottom: 16px; }
  .party { flex: 1; border: 1px solid #ccc; padding: 10px; border-radius: 4px; }
  .party-label { font-weight: bold; font-size: 9pt; color: #666; margin-bottom: 4px; text-transform: uppercase; }
  .party-name { font-weight: bold; font-size: 10pt; margin-bottom: 2px; }
  .party-addr { font-size: 9pt; color: #333; }
  .divider { border-top: 1px solid #000; margin: 12px 0; }
  table.terms { width: 100%; border-collapse: collapse; margin: 12px 0; }
  table.terms tr { border-bottom: 1px solid #eee; }
  table.terms td { padding: 5px 8px; vertical-align: top; }
  table.terms td.label { font-weight: bold; width: 160px; white-space: nowrap; color: #333; font-size: 9pt; }
  table.terms td.value { font-size: 10pt; }
  table.goods { width: 100%; border-collapse: collapse; margin: 12px 0; }
  table.goods th { border: 1px solid #000; padding: 5px 8px; background: #f0f0f0; font-size: 9pt; text-align: center; }
  table.goods td { border: 1px solid #000; padding: 5px 8px; font-size: 9pt; }
  table.goods td.right { text-align: right; }
  table.goods td.center { text-align: center; }
  .total-row td { font-weight: bold; background: #f8f8f8; }
  .clause { font-size: 9pt; margin: 8px 0; }
  .sig-section { margin-top: 36px; display: flex; justify-content: space-between; }
  .sig-box { width: 45%; }
  .sig-label { font-weight: bold; font-size: 9pt; margin-bottom: 2px; }
  .sig-name { font-size: 9pt; margin-bottom: 4px; }
  .sig-stamp { min-height: 120px; display: flex; align-items: flex-end; }
  .sig-line { border-top: 1px solid #000; margin-top: 8px; padding-top: 4px; font-size: 8pt; color: #666; }
</style>
</head>
<body>

  <div class="header">
    <div class="header-logo">${logoHtml}</div>
    <div class="header-title">
      <h1>SALES CONTRACT</h1>
      <h2>销售合同</h2>
      <div class="ref">
        Contract No.: <strong>${order.contract_id ?? '—'}</strong><br/>
        Container No.: <strong>${order.container_number}</strong><br/>
        Date: <strong>${contractDate}</strong>
      </div>
    </div>
    <div style="min-width:200px;"></div>
  </div>

  <div class="parties">
    <div class="party">
      <div class="party-label">Seller / 卖方</div>
      <div class="party-name">${SELLER.name}</div>
      <div class="party-addr">${SELLER.address}, ${SELLER.city}, ${SELLER.country}</div>
    </div>
    <div class="party">
      <div class="party-label">Buyer / 买方</div>
      <div class="party-name">${buyerName}</div>
      <div class="party-addr">${buyerAddress}</div>
    </div>
  </div>

  <p class="clause">The Seller agrees to sell and the Buyer agrees to buy the following goods on the terms and conditions set forth below:</p>

  <table class="goods">
    <thead>
      <tr>
        <th>Description of Goods</th>
        <th>Brand</th>
        <th>Quantity</th>
        <th>Unit Price (EUR/kg)</th>
        <th>Total Amount (EUR)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${order.product ?? '—'}</td>
        <td class="center">${order.brand ?? '—'}</td>
        <td class="center">${fmt(order.quantity)} ${unit}</td>
        <td class="right">EUR ${fmt(order.price, 4)}/kg</td>
        <td class="right">EUR ${fmt(total)}</td>
      </tr>
      <tr class="total-row">
        <td colspan="4" style="text-align:right; padding-right:8px;">TOTAL:</td>
        <td class="right">EUR ${fmt(total)}</td>
      </tr>
    </tbody>
  </table>

  <table class="terms">
    <tr><td class="label">More or Less:</td><td class="value">5% more or less allowed both for quantity and amount</td></tr>
    <tr><td class="label">Parity:</td><td class="value">${order.parity ?? '—'}</td></tr>
    <tr><td class="label">Packing:</td><td class="value">${packing}</td></tr>
    <tr><td class="label">Shipment:</td><td class="value">${shipment}</td></tr>
    <tr><td class="label">Payment:</td><td class="value">${order.payment_terms ?? '—'}</td></tr>
    ${order.origin ? `<tr><td class="label">Origin:</td><td class="value">${order.origin}</td></tr>` : ''}
    ${order.shelf_life ? `<tr><td class="label">Shelf Life:</td><td class="value">${order.shelf_life}</td></tr>` : ''}
  </table>

  <div class="divider"></div>

  <div class="sig-section">
    <div class="sig-box">
      <div class="sig-label">SELLER / 卖方</div>
      <div class="sig-name">${SELLER.name}</div>
      <div class="sig-stamp">${sealHtml}</div>
      <div class="sig-line">Authorized Signature &amp; Company Stamp</div>
      <div class="sig-line" style="margin-top:8px;">Date: ${fmtDate(today)}</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">BUYER / 买方</div>
      <div class="sig-name">${buyerName}</div>
      <div class="sig-stamp"></div>
      <div class="sig-line">Authorized Signature &amp; Company Stamp</div>
      <div class="sig-line" style="margin-top:8px;">Date: _______________________</div>
    </div>
  </div>

</body>
</html>`
}
