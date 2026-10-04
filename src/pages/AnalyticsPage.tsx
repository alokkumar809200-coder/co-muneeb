import { useState, useEffect, useCallback } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  DateRangePicker,
  getDateRangeFromPreset,
  type DateRange,
} from '@/components/ui/DateRangePicker'
import { Card, CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { getDataLayer } from '@/lib/dataLayer'
import { formatCurrency, formatDate, formatDateShort } from '@/lib/utils'
import type { Sale, SaleItem, Expense, Product } from '@/types'

type Tab = 'overview' | 'products' | 'profit'

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [sales, setSales] = useState<Sale[]>([])
  const [allSaleItems, setAllSaleItems] = useState<SaleItem[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const r = getDateRangeFromPreset('last30')
    return { ...r, preset: 'last30' }
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const dl = getDataLayer()
      const [s, exps, prods] = await Promise.all([
        dl.getSales(dateRange.from, dateRange.to),
        dl.getExpenses(dateRange.from, dateRange.to),
        dl.getProducts(),
      ])
      setSales(s)
      setExpenses(exps)
      setProducts(prods)

      // Load all sale items for the filtered sales
      const allItems: SaleItem[] = []
      for (const sale of s) {
        const items = await dl.getSaleItems(sale.id)
        allItems.push(...items)
      }
      setAllSaleItems(allItems)
    } finally {
      setLoading(false)
    }
  }, [dateRange.from, dateRange.to])

  useEffect(() => { load() }, [load])

  // Computed metrics
  const totalRevenue = sales.reduce((s, sale) => s + sale.total_amount, 0)
  const totalCOGS = allSaleItems.reduce((s, i) => s + i.cost_price * i.quantity, 0)
  const grossProfit = totalRevenue - totalCOGS
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const netProfit = grossProfit - totalExpenses
  const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0'
  const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0'

  // Daily sales trend
  const salesByDate = new Map<string, number>()
  for (const sale of sales) {
    salesByDate.set(sale.sale_date, (salesByDate.get(sale.sale_date) ?? 0) + sale.total_amount)
  }
  const salesTrend = Array.from(salesByDate.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Expense by category
  const expenseByCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {})
  const expenseCategoryData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }))

  // Product performance
  const productSalesMap = new Map<string, { qty: number; revenue: number; cogs: number; name: string }>()
  for (const item of allSaleItems) {
    const existing = productSalesMap.get(item.product_id) ?? { qty: 0, revenue: 0, cogs: 0, name: item.product_name ?? '' }
    productSalesMap.set(item.product_id, {
      qty: existing.qty + item.quantity,
      revenue: existing.revenue + item.total_price,
      cogs: existing.cogs + item.cost_price * item.quantity,
      name: item.product_name ?? existing.name,
    })
  }

  const soldProductIds = new Set(allSaleItems.map((i) => i.product_id))

  const topProducts = Array.from(productSalesMap.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      qty: data.qty,
      revenue: data.revenue,
      margin: data.revenue > 0 ? (((data.revenue - data.cogs) / data.revenue) * 100).toFixed(1) : '0',
    }))
    .sort((a, b) => b.revenue - a.revenue)

  const slowProducts = products
    .filter((p) => !soldProductIds.has(p.id) && p.current_stock > 0)
    .map((p) => ({ id: p.id, name: p.name, stock: p.current_stock, unit: p.unit }))

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Business performance insights</p>
      </div>

      <DateRangePicker value={dateRange} onChange={setDateRange} />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {([
          { id: 'overview', label: 'Overview' },
          { id: 'products', label: 'Products' },
          { id: 'profit', label: 'Profit & Loss' },
        ] as { id: Tab; label: string }[]).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: formatCurrency(totalRevenue), color: 'text-gray-900' },
              { label: 'Transactions', value: String(sales.length), color: 'text-gray-900' },
              { label: 'Avg Sale Value', value: sales.length > 0 ? formatCurrency(totalRevenue / sales.length) : '₹0', color: 'text-gray-900' },
              { label: 'Total Expenses', value: formatCurrency(totalExpenses), color: 'text-red-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader title="Sales Trend" />
            {salesTrend.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={salesTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 11, fill: '#6b7280' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={60} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), 'Sales']} labelFormatter={(l) => formatDate(l)} />
                  <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>

          {expenseCategoryData.length > 0 && (
            <Card>
              <CardHeader title="Expenses by Category" />
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={expenseCategoryData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={60} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), 'Amount']} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {/* Products Tab */}
      {tab === 'products' && (
        <div className="space-y-5">
          <Card>
            <CardHeader title="Top Selling Products" subtitle="By revenue in selected period" />
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No sales data for this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">#</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Product</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Units Sold</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Revenue</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topProducts.map((p, i) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-900">{p.name}</td>
                        <td className="px-4 py-2.5 text-right text-gray-700">{p.qty}</td>
                        <td className="px-4 py-2.5 text-right text-gray-900 font-medium">{formatCurrency(p.revenue)}</td>
                        <td className="px-4 py-2.5 text-right text-emerald-600 font-medium">{p.margin}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Slow Moving Products"
              subtitle="Products with no sales in selected period"
              action={slowProducts.length > 0 ? <Badge variant="warning">{slowProducts.length}</Badge> : undefined}
            />
            {slowProducts.length === 0 ? (
              <p className="text-sm text-emerald-600 text-center py-4">All products had sales in this period. 🎉</p>
            ) : (
              <div className="space-y-2">
                {slowProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{p.stock} {p.unit} in stock</span>
                      <Badge variant="warning">No Sales</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Profit & Loss Tab */}
      {tab === 'profit' && (
        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Profit & Loss Summary"
              subtitle="Estimated — based on recorded transactions"
              action={<Badge variant="warning">ESTIMATED</Badge>}
            />
            <div className="space-y-3">
              {[
                { label: 'Revenue', value: totalRevenue, color: 'text-gray-900', indent: false },
                { label: '− Cost of Goods Sold (COGS)', value: -totalCOGS, color: 'text-red-600', indent: true },
                { label: '= Gross Profit', value: grossProfit, color: grossProfit >= 0 ? 'text-emerald-600' : 'text-red-600', indent: false, bold: true },
                { label: '− Operating Expenses', value: -totalExpenses, color: 'text-red-600', indent: true },
                { label: '= Estimated Net Profit', value: netProfit, color: netProfit >= 0 ? 'text-emerald-700' : 'text-red-700', indent: false, bold: true, highlight: true },
              ].map(({ label, value, color, indent, bold, highlight }) => (
                <div
                  key={label}
                  className={`flex justify-between items-center py-2 border-b border-gray-100 last:border-0 ${indent ? 'pl-4' : ''} ${highlight ? 'bg-gray-50 rounded-lg px-3' : ''}`}
                >
                  <span className={`text-sm ${bold ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{label}</span>
                  <span className={`text-sm font-semibold ${color}`}>
                    {value < 0 ? `−${formatCurrency(Math.abs(value))}` : formatCurrency(value)}
                  </span>
                </div>
              ))}
              <div className="flex gap-4 pt-2">
                <div className="flex-1 bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Gross Margin</p>
                  <p className="text-lg font-bold text-blue-700">{grossMargin}%</p>
                </div>
                <div className="flex-1 bg-indigo-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Net Margin (est.)</p>
                  <p className={`text-lg font-bold ${Number(netMargin) >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>{netMargin}%</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader title="Co.Muneeb Insights" />
            <div className="space-y-2">
              {topProducts.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 text-sm text-emerald-700">
                  ✅ {topProducts[0].name} is your top product with {formatCurrency(topProducts[0].revenue)} in revenue.
                </div>
              )}
              {slowProducts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-sm text-amber-700">
                  ⚠️ {slowProducts.length} product{slowProducts.length > 1 ? 's have' : ' has'} no recorded sales in this period.
                </div>
              )}
              {netProfit > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 text-sm text-blue-700">
                  ℹ️ Estimated net profit is {formatCurrency(netProfit)} ({netMargin}% margin) for this period.
                </div>
              )}
              {netProfit < 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-700">
                  ⚠️ Expenses exceed gross profit. Consider reviewing costs.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
