import { useState, useEffect, useCallback } from 'react'
import { Receipt, Plus, Trash2 } from 'lucide-react'
import {
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
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Card, CardHeader } from '@/components/ui/Card'
import ExpenseForm from '@/components/expenses/ExpenseForm'
import { getDataLayer } from '@/lib/dataLayer'
import { formatCurrency, formatDate, todayISO } from '@/lib/utils'
import type { Expense } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  Rent: '#6366f1',
  Electricity: '#f59e0b',
  Salary: '#10b981',
  Transport: '#3b82f6',
  Maintenance: '#f97316',
  Other: '#8b5cf6',
  Miscellaneous: '#6b7280',
}

function getCategoryBadge(category: string) {
  const colors: Record<string, 'primary' | 'warning' | 'success' | 'info' | 'neutral'> = {
    Rent: 'primary',
    Electricity: 'warning',
    Salary: 'success',
    Transport: 'info',
    Maintenance: 'warning',
  }
  return <Badge variant={colors[category] ?? 'neutral'}>{category}</Badge>
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const r = getDateRangeFromPreset('thisMonth')
    return { ...r, preset: 'thisMonth' }
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setExpenses(await getDataLayer().getExpenses(dateRange.from, dateRange.to))
    } finally {
      setLoading(false)
    }
  }, [dateRange.from, dateRange.to])

  useEffect(() => { load() }, [load])

  const today = todayISO()
  const todayExpenses = expenses.filter((e) => e.expense_date === today)
  const todayTotal = todayExpenses.reduce((s, e) => s + e.amount, 0)
  const monthlyTotal = expenses.reduce((s, e) => s + e.amount, 0)

  // Category breakdown
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {})
  const categoryData = Object.entries(byCategory).map(([name, value]) => ({ name, value }))

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500">{expenses.length} expense entries</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>
          Add Expense
        </Button>
      </div>

      <DateRangePicker value={dateRange} onChange={setDateRange} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">Today's Expenses</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(todayTotal)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">Period Total</p>
          <p className="text-xl font-bold text-red-600 mt-1">{formatCurrency(monthlyTotal)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">Categories</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{Object.keys(byCategory).length}</p>
        </div>
      </div>

      {/* Chart */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader title="Expenses by Category" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={60} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), 'Amount']} />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                {categoryData.map((entry) => (
                  <rect key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Table */}
      {expenses.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-7 h-7" />}
          title="No expenses in this period"
          description="Track your business expenses to see profit clearly."
          action={{ label: 'Add Expense', onClick: () => setAddOpen(true) }}
        />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(e.expense_date)}</td>
                    <td className="px-4 py-3">{getCategoryBadge(e.category)}</td>
                    <td className="px-4 py-3 text-gray-600">{e.description || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-red-600">{formatCurrency(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-700">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-red-700">{formatCurrency(monthlyTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {expenses.map((e) => (
              <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500">{formatDate(e.expense_date)}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{e.description || e.category}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getCategoryBadge(e.category)}
                    <p className="font-bold text-red-600">{formatCurrency(e.amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Expense" size="md">
        <ExpenseForm onSaved={() => { setAddOpen(false); load() }} onCancel={() => setAddOpen(false)} />
      </Modal>
    </div>
  )
}
