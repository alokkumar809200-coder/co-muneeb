import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  BarChart2,
  DollarSign,
  Package,
  Users,
  Building2,
  AlertTriangle,
  ShoppingCart,
  Plus,
  Lightbulb,
} from 'lucide-react'
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
import { Card, CardHeader } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import QuickEntryModal from '@/components/quick-entry/QuickEntryModal'
import { getDataLayer } from '@/lib/dataLayer'
import { formatCurrency, formatDateShort, formatDate } from '@/lib/utils'
import type { DashboardStats } from '@/types'

interface StatCardProps {
  label: string
  value: string
  icon: React.ReactNode
  accent: string
  sub?: string
}

function StatCard({ label, value, icon, accent, sub }: StatCardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-gradient-to-br ${accent} p-5 flex items-start gap-4 shadow-sm`}>
      <div className="w-10 h-10 rounded-lg bg-white/70 flex items-center justify-center flex-shrink-0 shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [quickOpen, setQuickOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setStats(await getDataLayer().getDashboardStats())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const handleFocus = () => load()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [load])

  if (loading) return <PageLoader />

  const s = stats!
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  // Rule-based insights
  const insights: { type: 'warning' | 'info' | 'success'; text: string }[] = []
  if (s.lowStockItems > 0)
    insights.push({ type: 'warning', text: `${s.lowStockItems} product${s.lowStockItems > 1 ? 's are' : ' is'} running low on stock.` })
  if (s.outOfStockItems > 0)
    insights.push({ type: 'warning', text: `${s.outOfStockItems} product${s.outOfStockItems > 1 ? 's are' : ' is'} out of stock.` })
  if (s.totalDebtorsReceivable > 0)
    insights.push({ type: 'info', text: `${formatCurrency(s.totalDebtorsReceivable)} is currently outstanding from customers.` })
  if (s.topSellingProducts.length > 0)
    insights.push({ type: 'success', text: `${s.topSellingProducts[0].product_name} is your best-selling product this month.` })
  if (s.slowMovingProducts.length > 0)
    insights.push({ type: 'info', text: `${s.slowMovingProducts.length} product${s.slowMovingProducts.length > 1 ? 's have' : ' has'} had no recent sales.` })

  const insightColors = {
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{today}</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setQuickOpen(true)}>
          Quick Add
        </Button>
      </div>

      {/* Demo banner */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-700">
          <span className="font-semibold">Demo Store</span> — Sample data loaded. Add real transactions to see your numbers.
        </p>
      </div>

      {/* Financial stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Sales"
          value={formatCurrency(s.todaySales)}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          accent="from-emerald-50 to-white"
          sub="Revenue today"
        />
        <StatCard
          label="Monthly Sales"
          value={formatCurrency(s.monthlySales)}
          icon={<BarChart2 className="w-5 h-5 text-blue-600" />}
          accent="from-blue-50 to-white"
          sub="This month"
        />
        <StatCard
          label="Est. Today's Profit"
          value={formatCurrency(s.todayProfit)}
          icon={<DollarSign className="w-5 h-5 text-indigo-600" />}
          accent="from-indigo-50 to-white"
          sub="Estimated"
        />
        <StatCard
          label="Inventory Value"
          value={formatCurrency(s.totalInventoryValue)}
          icon={<Package className="w-5 h-5 text-purple-600" />}
          accent="from-purple-50 to-white"
          sub="Stock on hand"
        />
      </div>

      {/* Business stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{s.totalProducts}</p>
          <p className="text-xs text-gray-500 mt-1">Total Products</p>
        </div>
        <div className={`rounded-xl border p-4 text-center shadow-sm ${s.totalDebtorsReceivable > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
          <p className={`text-xl font-bold ${s.totalDebtorsReceivable > 0 ? 'text-amber-700' : 'text-gray-900'}`}>
            {formatCurrency(s.totalDebtorsReceivable)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Receivables</p>
          <Link to="/debtors" className="text-xs text-indigo-600 hover:underline mt-1 block">View →</Link>
        </div>
        <div className={`rounded-xl border p-4 text-center shadow-sm ${s.totalCreditorsPayable > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
          <p className={`text-xl font-bold ${s.totalCreditorsPayable > 0 ? 'text-red-700' : 'text-gray-900'}`}>
            {formatCurrency(s.totalCreditorsPayable)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Payables</p>
          <Link to="/creditors" className="text-xs text-indigo-600 hover:underline mt-1 block">View →</Link>
        </div>
        <div className={`rounded-xl border p-4 text-center shadow-sm ${s.lowStockItems > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
          <p className={`text-2xl font-bold ${s.lowStockItems > 0 ? 'text-red-700' : 'text-gray-900'}`}>
            {s.lowStockItems}
          </p>
          <p className="text-xs text-gray-500 mt-1">Low Stock Items</p>
          <Link to="/inventory" className="text-xs text-indigo-600 hover:underline mt-1 block">View →</Link>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Sales Trend" subtitle="Last 30 days" />
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={s.salesTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateShort}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={60} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: number) => [formatCurrency(v), 'Sales']}
                labelFormatter={(l) => formatDate(l)}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Top Products" subtitle="By quantity sold (30 days)" />
          {s.topSellingProducts.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No sales data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={s.topSellingProducts} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="product_name"
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={40} />
                <Tooltip formatter={(v: number) => [v, 'Units']} />
                <Bar dataKey="total_qty" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader
            title="Co.Muneeb Insights"
            subtitle="Smart alerts from your store data"
            action={<Lightbulb className="w-5 h-5 text-amber-500" />}
          />
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm ${insightColors[insight.type]}`}
              >
                <span className="mt-0.5 flex-shrink-0">
                  {insight.type === 'warning' ? '⚠️' : insight.type === 'success' ? '✅' : 'ℹ️'}
                </span>
                <span>{insight.text}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: '+ Add Sale', to: '/sales', color: 'bg-emerald-600 hover:bg-emerald-700' },
            { label: '+ Add Purchase', to: '/purchases', color: 'bg-blue-600 hover:bg-blue-700' },
            { label: '+ Add Product', to: '/inventory', color: 'bg-indigo-600 hover:bg-indigo-700' },
            { label: '+ Add Expense', to: '/expenses', color: 'bg-amber-600 hover:bg-amber-700' },
            { label: '+ Customer Pay', to: '/debtors', color: 'bg-purple-600 hover:bg-purple-700' },
            { label: '+ Supplier Pay', to: '/creditors', color: 'bg-red-600 hover:bg-red-700' },
          ].map(({ label, to, color }) => (
            <Link
              key={label}
              to={to}
              className={`${color} text-white text-xs font-semibold rounded-xl py-3 px-2 text-center transition-colors shadow-sm`}
            >
              {label}
            </Link>
          ))}
        </div>
      </Card>

      <QuickEntryModal open={quickOpen} onClose={() => { setQuickOpen(false); load() }} />
    </div>
  )
}
