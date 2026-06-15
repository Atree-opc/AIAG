'use client'

import { useEffect, useState } from 'react'
import { Order } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  pending:    '待处理 Pending',
  production: '生产中 In Production',
  shipped:    '已装船 Shipped',
  arrived:    '已到港 Arrived',
  completed:  '已完成 Completed',
}

function authHeaders() {
  return { 'Content-Type': 'application/json' }
}

export default function StaffOrdersOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchOrders() {
    setLoading(true)
    const res = await fetch('/api/orders', { headers: authHeaders() })
    const data = await res.json()
    setOrders(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Orders Overview / 订单总览</h1>
        <p className="text-sm text-text-secondary mt-0.5">{orders.length} orders total</p>
      </div>

      {loading ? (
        <p className="text-text-secondary text-sm">Loading... / 加载中...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-max">
            <thead>
              <tr className="border-b border-gray-100 text-text-secondary text-xs">
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Container / 货柜号</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Contract / 合同</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">B/L / 提单号</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Brand / 品牌</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Product / 产品</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Price €/kg / 单价</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Quantity / 数量</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Unit / 单位</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Loading Date / 提货日</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">ETD / 预计离港</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">On Board / 真实离港</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">ETA / 预计到港</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Batch No. / 批次号</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Production Date / 生产日期</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">DF Invoice No.</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">DF-AI Price / 进价</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Freight/Forwarder / 货代</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Freight Method / 货运方式</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">L/C Number / 信用证号</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Port of Loading / 装货港</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Port of Discharge / 卸货港</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Is Organic / 是否有机</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">TC Contract No. / 有机合同号</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">TC Invoice No. / 有机发票号</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">TC Seller / 有机卖方</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">TC Buyer / 有机买方</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Status / 状态</th>
                <th className="text-left px-3 py-3 font-medium whitespace-nowrap">Container # / 航运货柜号</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={28} className="px-4 py-8 text-center text-text-muted">No orders / 暂无订单</td></tr>
              )}
              {orders.map(order => (
                <tr key={order.container_number} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 font-mono text-xs font-semibold whitespace-nowrap">{order.container_number}</td>
                  <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{order.contract_id ?? '—'}</td>
                  <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{order.bl ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{order.brand ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{order.product ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.price ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.quantity ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.quantity_unit ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.loading_date?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.etd?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.ship_on_board_date?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.eta?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.batch_no ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.production_date?.slice(0, 10) ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.df_invoice_no ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.df_ai_price ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{order.freight_forwarder ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{order.freight_forwarder_method ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.lc_number ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{order.port_of_loading ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{order.port_of_discharge ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.is_organic ? 'Yes / 是' : 'No / 否'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.tc_contract_no ?? '—'}</td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap">{order.tc_invoice_no ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{order.tc_seller ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{order.tc_buyer ?? '—'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-text-secondary">
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs max-w-xs truncate" title={order.remarks ?? ''}>{order.remarks ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
