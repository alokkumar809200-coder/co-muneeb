import { formatCurrency, formatDate } from '@/lib/utils'
import type { SupplierTransaction } from '@/types'

interface SupplierLedgerProps {
  transactions: SupplierTransaction[]
  openingBalance: number
}

export default function SupplierLedger({ transactions, openingBalance }: SupplierLedgerProps) {
  const sorted = [...transactions].sort((a, b) => a.transaction_date.localeCompare(b.transaction_date))

  let runningBalance = openingBalance
  const rows = sorted.map((tx) => {
    runningBalance += tx.credit_amount - tx.debit_amount
    return { ...tx, runningBalance }
  })

  const display = [...rows].reverse()

  if (display.length === 0) {
    return <div className="text-sm text-gray-500 text-center py-8">No transactions recorded yet.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Credit (CR)</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Payment (DR)</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {display.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-50">
              <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{formatDate(tx.transaction_date)}</td>
              <td className="px-3 py-2 text-gray-700">{tx.description}</td>
              <td className="px-3 py-2 text-right text-red-600 font-medium">
                {tx.credit_amount > 0 ? formatCurrency(tx.credit_amount) : '—'}
              </td>
              <td className="px-3 py-2 text-right text-emerald-600 font-medium">
                {tx.debit_amount > 0 ? formatCurrency(tx.debit_amount) : '—'}
              </td>
              <td className={`px-3 py-2 text-right font-semibold ${tx.runningBalance > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(tx.runningBalance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
