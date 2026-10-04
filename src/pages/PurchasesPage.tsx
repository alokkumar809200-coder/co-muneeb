import { useState, useEffect, useCallback } from 'react'
import { Truck, Plus } from 'lucide-react'
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
import PurchaseForm from '@/components/purchases/PurchaseForm'
import { getDataLayer } from '@/lib/dataLayer'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Purchase } from '@/types'

const paymentStatusBadge = (status: string) => {
  if (status === 'paid') return <Badge variant="success">Paid</Badge>
  if (status === 'credit') return <Badge variant="warning">Credit</Badge>
  return <Badge variant="info">Partial</Badge>
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const r = getDateRangeFromPreset('last30')
    return { ...r, preset: 'last30' }
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setPurchases(await getDataLayer().getPurchases(dateRange.from, dateRange.to))
    } finally {
      setLoading(false)
    }
  }, [dateRange.from, dateRange.to])

  useEffect(() => { load() }, [load])

  const totalSpent = purchases.reduce((s, p) => s + p.total_amount, 0)

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
          <p className="text-sm text-gray-500">{purchases.length} transactions in selected period</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>
          Record Purchase
        </Button>
      </div>

      <DateRangePicker value={dateRange} onChange={setDateRange} />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="!p-4">
          <p className="text-xs text-gray-500">Total Spent</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalSpent)}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-gray-500">Transactions</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{purchases.length}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-gray-500">Avg per Purchase</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {purchases.length > 0 ? formatCurrency(totalSpent / purchases.length) : '₹0'}
          </p>
        </Card>
      </div>

      {purchases.length === 0 ? (
        <EmptyState
          icon={<Truck className="w-7 h-7" />}
          title="No purchases in this period"
          description="Record a purchase to track your inventory restocking."
          action={{ label: 'Record Purchase', onClick: () => setAddOpen(true) }}
        />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Supplier</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(p.purchase_date)}</td>
                    <td className="px-4 py-3 text-gray-900">{p.supplier_name || '—'}</td>
                    <td className="px-4 py-3 text-center">{paymentStatusBadge(p.payment_status)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(p.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {purchases.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500">{formatDate(p.purchase_date)}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{p.supplier_name || 'Unknown Supplier'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {paymentStatusBadge(p.payment_status)}
                    <p className="font-bold text-gray-900">{formatCurrency(p.total_amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Record Purchase" size="xl">
        <PurchaseForm onSaved={() => { setAddOpen(false); load() }} onCancel={() => setAddOpen(false)} />
      </Modal>
    </div>
  )
}
