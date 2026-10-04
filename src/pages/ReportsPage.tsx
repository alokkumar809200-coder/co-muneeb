import { useState, useEffect, useCallback } from 'react'
import { Download, Printer } from 'lucide-react'
import Papa from 'papaparse'
import {
  DateRangePicker,
  getDateRangeFromPreset,
  type DateRange,
} from '@/components/ui/DateRangePicker'
import Button from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import { getDataLayer } from '@/lib/dataLayer'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Sale, SaleItem, Purchase, PurchaseItem, Expense, Customer, Supplier, Product } from '@/types'

type ReportTab = 'sales' | 'purchases' | 'expenses' | 'inventory' | 'debtors' | 'creditors'

interface ReportData {
  sales: Sale[]
  saleItems: SaleItem[]
  purchases: Purchase[]
  purchaseItems: PurchaseItem[]
  expenses: Expense[]
  customers: Customer[]
  suppliers: Supplier[]
  products: Product[]
}

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>('sales')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ReportData>({
    sales: [], saleItems: [], purchases: [], purchaseItems: [],
    expenses: [], customers: [], suppliers: [], products: [],
  })

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const r = getDateRangeFromPreset('thisMonth')
    return { ...r, preset: 'thisMonth' }
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const dl = getDataLayer()
      const [sales, purchases, expenses, customers, suppliers, products] = await Promise.all([
        dl.getSales(dateRange.from, dateRange.to),
        dl.getPurchases(dateRange.from, dateRange.to),
        dl.getExpenses(dateRange.from, dateRange.to),
        dl.getCustomers(),
        dl.getSuppliers(),
        dl.getProducts(),
      ])

      const saleItems: SaleItem[] = []
      for (const sale of sales) {
        const items = await dl.getSaleItems(sale.id)
        saleItems.push(...items)
      }

      const purchaseItems: PurchaseItem[] = []
      for (const purchase of purchases) {
        const items = await dl.getPurchaseItems(purchase.id)
        purchaseItems.push(...items)
      }

      setData({ sales, saleItems, purchases, purchaseItems, expenses, customers, suppliers, products })
    } finally {
      setLoading(false)
    }
  }, [dateRange.from, dateRange.to])

  useEffect(() => { load() }, [load])

  const exportCSV = () => {
    let rows: Record<string, unknown>[] = []
    let filename = `${tab}-report.csv`

    if (tab === 'sales') {
      rows = data.sales.map((s) => ({
        Date: s.sale_date,
        Customer: s.customer_name || '',
        Payment: s.payment_method,
        Amount: s.total_amount,
      }))
    } else if (tab === 'purchases') {
      rows = data.purchases.map((p) => ({
        Date: p.purchase_date,
        Supplier: p.supplier_name || '',
        Status: p.payment_status,
        Amount: p.total_amount,
      }))
    } else if (tab === 'expenses') {
      rows = data.expenses.map((e) => ({
        Date: e.expense_date,
        Category: e.category,
        Description: e.description || '',
        Amount: e.amount,
      }))
    } else if (tab === 'inventory') {
      rows = data.products.map((p) => ({
        Name: p.name,
        Category: p.category || '',
        Stock: p.current_stock,
        Unit: p.unit,
        'Buy Price': p.purchase_price,
        'Sell Price': p.selling_price,
        'Stock Value': p.current_stock * p.purchase_price,
      }))
    } else if (tab === 'debtors') {
      rows = data.customers.map((c) => ({
        Name: c.name,
        Phone: c.mobile || '',
        'Opening Balance': c.opening_balance,
        'Current Balance': c.current_balance,
      }))
    } else if (tab === 'creditors') {
      rows = data.suppliers.map((s) => ({
        Name: s.name,
        Phone: s.mobile || '',
        'Opening Balance': s.opening_balance,
        'Current Balance': s.current_balance,
      }))
    }

    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const TABS: { id: ReportTab; label: string }[] = [
    { id: 'sales', label: 'Sales' },
    { id: 'purchases', label: 'Purchases' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'debtors', label: 'Debtors' },
    { id: 'creditors', label: 'Creditors' },
  ]

  if (loading) return <PageLoader />

  const renderTable = () => {
    if (tab === 'sales') {
      if (data.sales.length === 0) return <EmptyState title="No sales in this period" />
      const saleItemsBySaleId = new Map<string, SaleItem[]>()
      for (const item of data.saleItems) {
        const arr = saleItemsBySaleId.get(item.sale_id) ?? []
        arr.push(item)
        saleItemsBySaleId.set(item.sale_id, arr)
      }
      return (
        <table className="min-w-full text-sm divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Products</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Payment</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.sales.map((s) => {
              const items = saleItemsBySaleId.get(s.id) ?? []
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{formatDate(s.sale_date)}</td>
                  <td className="px-4 py-3 text-gray-700">{items.map((i) => i.product_name).join(', ') || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.customer_name || '—'}</td>
                  <td className="px-4 py-3 text-center capitalize text-gray-600">{s.payment_method}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(s.total_amount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )
    }

    if (tab === 'purchases') {
      if (data.purchases.length === 0) return <EmptyState title="No purchases in this period" />
      return (
        <table className="min-w-full text-sm divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Supplier</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.purchases.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{formatDate(p.purchase_date)}</td>
                <td className="px-4 py-3 text-gray-700">{p.supplier_name || '—'}</td>
                <td className="px-4 py-3 text-center capitalize text-gray-600">{p.payment_status}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    if (tab === 'expenses') {
      if (data.expenses.length === 0) return <EmptyState title="No expenses in this period" />
      return (
        <table className="min-w-full text-sm divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Description</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.expenses.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{formatDate(e.expense_date)}</td>
                <td className="px-4 py-3 text-gray-700">{e.category}</td>
                <td className="px-4 py-3 text-gray-600">{e.description || '—'}</td>
                <td className="px-4 py-3 text-right font-medium text-red-600">{formatCurrency(e.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    if (tab === 'inventory') {
      return (
        <table className="min-w-full text-sm divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Category</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Stock</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Buy Price</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Sell Price</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-600">{p.category || '—'}</td>
                <td className="px-4 py-3 text-right text-gray-700">{p.current_stock} {p.unit}</td>
                <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(p.purchase_price)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(p.selling_price)}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.current_stock * p.purchase_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    if (tab === 'debtors') {
      return (
        <table className="min-w-full text-sm divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Phone</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Opening Balance</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Current Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.mobile || '—'}</td>
                <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(c.opening_balance)}</td>
                <td className={`px-4 py-3 text-right font-medium ${c.current_balance > 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                  {formatCurrency(c.current_balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    if (tab === 'creditors') {
      return (
        <table className="min-w-full text-sm divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Phone</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Opening Balance</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Current Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-gray-600">{s.mobile || '—'}</td>
                <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(s.opening_balance)}</td>
                <td className={`px-4 py-3 text-right font-medium ${s.current_balance > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                  {formatCurrency(s.current_balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    return null
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">Export and print your business data</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={exportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <DateRangePicker value={dateRange} onChange={setDateRange} />

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-gray-200">
        {TABS.map(({ id, label }) => (
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        {renderTable()}
      </div>
    </div>
  )
}
