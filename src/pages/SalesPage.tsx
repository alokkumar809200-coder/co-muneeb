import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, Plus } from 'lucide-react'
import {
  DateRangePicker,
  getDateRangeFromPreset,
  type DateRange,
} from '@/components/ui/DateRangePicker'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Card } from '@/components/ui/Card'
import SaleForm from '@/components/sales/SaleForm'
import { getDataLayer } from '@/lib/dataLayer'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Sale, SaleItem } from '@/types'

const paymentBadge = (method: string) => {
  if (method === 'cash') return <Badge variant="success">Cash</Badge>
  if (method === 'upi') return <Badge variant="info">UPI</Badge>
  return <Badge variant="warning">Credit</Badge>
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [allSaleItems, setAllSaleItems] = useState<SaleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const r = getDateRangeFromPreset('last30')
    return { ...r, preset: 'last30' }
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const dl = getDataLayer()
      const [s, items] = await Promise.all([
        dl.getSales(dateRange.from, dateRange.to),
        dl.getSales().then(async (allSales) => {
          const allItems: SaleItem[] = []
          for (const sale of allSales) {
            const i = await dl.getSaleItems(sale.id)
            allItems.push(...i)
          }
          return allItems
        }),
      ])
      setSales(s)
      setAllSaleItems(items)
    } finally {
      setLoading(false)
    }
  }, [dateRange.from, dateRange.to])

  useEffect(() => { load() }, [load])

  const saleItemsBySaleId = new Map<string, SaleItem[]>()
  for (const item of allSaleItems) {
    const arr = saleItemsBySaleId.get(item.sale_id) ?? []
    arr.push(item)
    saleItemsBySaleId.set(item.sale_id, arr)
  }

  const totalRevenue = sales.reduce((s, sale) => s + sale.total_amount, 0)
  const totalCOGS = sales.reduce((s, sale) => {
    const items = saleItemsBySaleId.get(sale.id) ?? []
    return s + items.reduce((acc, i) => acc + i.cost_price * i.quantity, 0)
  }, 0)
  const grossProfit = totalRevenue - totalCOGS
  const margin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0'

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-sm text-gray-500">{sales.length} transactions in selected period</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>
          Record Sale
        </Button>
      </div>

      <DateRangePicker value={dateRange} onChange={setDateRange} />

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4">
          <p className="text-xs text-gray-500">Total Revenue</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-gray-500">Transactions</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{sales.length}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-gray-500">Gross Profit (est.)</p>
          <p className={`text-xl font-bold mt-1 ${grossProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(grossProfit)}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-gray-500">Gross Margin</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{margin}%</p>
        </Card>
      </div>

      {/* Table */}
      {sales.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="w-7 h-7" />}
          title="No sales in this period"
          description="Record your first sale to see it here."
          action={{ label: 'Record Sale', onClick: () => setAddOpen(true) }}
        />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Products</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sales.map((sale) => {
                  const items = saleItemsBySaleId.get(sale.id) ?? []
                  const cogs = items.reduce((s, i) => s + i.cost_price * i.quantity, 0)
                  const profit = sale.total_amount - cogs
                  const productNames = items.map((i) => i.product_name).filter(Boolean).join(', ')
                  return (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(sale.sale_date)}</td>
                      <td className="px-4 py-3 text-gray-900 max-w-xs truncate">{productNames || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{sale.customer_name || '—'}</td>
                      <td className="px-4 py-3 text-center">{paymentBadge(sale.payment_method)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(sale.total_amount)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(profit)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {sales.map((sale) => {
              const items = saleItemsBySaleId.get(sale.id) ?? []
              const cogs = items.reduce((s, i) => s + i.cost_price * i.quantity, 0)
              const profit = sale.total_amount - cogs
              const productNames = items.map((i) => i.product_name).filter(Boolean).join(', ')
              return (
                <div key={sale.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-gray-500">{formatDate(sale.sale_date)}</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5 truncate max-w-[200px]">{productNames || 'Sale'}</p>
                    </div>
                    {paymentBadge(sale.payment_method)}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{sale.customer_name || 'Walk-in'}</span>
                    <span className="font-bold text-gray-900">{formatCurrency(sale.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Profit</span>
                    <span className={profit >= 0 ? 'text-emerald-600' : 'text-red-600'}>{formatCurrency(profit)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Record Sale" size="xl">
        <SaleForm onSaved={() => { setAddOpen(false); load() }} onCancel={() => setAddOpen(false)} />
      </Modal>
    </div>
  )
}
