import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Phone } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import CustomerLedger from '@/components/debtors/CustomerLedger'
import { getDataLayer } from '@/lib/dataLayer'
import { formatCurrency, generateId, todayISO } from '@/lib/utils'
import type { Customer, CustomerTransaction } from '@/types'

const STORE_ID = 'seed-store-001'

export default function DebtorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [creditOpen, setCreditOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [creditAmount, setCreditAmount] = useState('')
  const [creditDesc, setCreditDesc] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const dl = getDataLayer()
      const [customers, txs] = await Promise.all([
        dl.getCustomers(),
        dl.getCustomerTransactions(id),
      ])
      setCustomer(customers.find((c) => c.id === id) ?? null)
      setTransactions(txs)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const handlePayment = async () => {
    if (!customer || !paymentAmount) return
    setSaving(true)
    try {
      await getDataLayer().addCustomerTransaction({
        store_id: STORE_ID,
        customer_id: customer.id,
        transaction_date: todayISO(),
        description: 'Payment received',
        debit_amount: 0,
        credit_amount: Number(paymentAmount),
        balance: -Number(paymentAmount),
        transaction_type: 'credit',
      })
      setPaymentOpen(false)
      setPaymentAmount('')
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleCredit = async () => {
    if (!customer || !creditAmount) return
    setSaving(true)
    try {
      await getDataLayer().addCustomerTransaction({
        store_id: STORE_ID,
        customer_id: customer.id,
        transaction_date: todayISO(),
        description: creditDesc || 'Credit added',
        debit_amount: Number(creditAmount),
        credit_amount: 0,
        balance: Number(creditAmount),
        transaction_type: 'debit',
      })
      setCreditOpen(false)
      setCreditAmount('')
      setCreditDesc('')
      load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />
  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-gray-500">Customer not found.</p>
        <Link to="/debtors" className="mt-4 text-indigo-600 hover:underline">← Back to Debtors</Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/debtors" className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          {customer.mobile && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
              <Phone className="w-3.5 h-3.5" />
              {customer.mobile}
            </div>
          )}
        </div>
      </div>

      {/* Balance card */}
      <div className={`rounded-xl border p-5 flex items-center justify-between ${customer.current_balance > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
        <div>
          <p className="text-sm text-gray-500">Outstanding Balance</p>
          <p className={`text-3xl font-bold mt-1 ${customer.current_balance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {formatCurrency(Math.max(0, customer.current_balance))}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="success" onClick={() => setPaymentOpen(true)}>Record Payment</Button>
          <Button variant="secondary" onClick={() => setCreditOpen(true)}>Add Credit</Button>
        </div>
      </div>

      {/* Ledger */}
      <Card>
        <CardHeader title="Transaction History" subtitle={`${transactions.length} transactions`} />
        <CustomerLedger transactions={transactions} openingBalance={customer.opening_balance} />
      </Card>

      {/* Payment modal */}
      <Modal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Record Payment"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPaymentOpen(false)}>Cancel</Button>
            <Button variant="success" loading={saving} onClick={handlePayment}>Record</Button>
          </>
        }
      >
        <Input
          label="Amount Received (₹)"
          type="number"
          min="1"
          prefix="₹"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
        />
      </Modal>

      {/* Credit modal */}
      <Modal
        open={creditOpen}
        onClose={() => setCreditOpen(false)}
        title="Add Credit"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreditOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleCredit}>Add Credit</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Amount (₹)"
            type="number"
            min="1"
            prefix="₹"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
          />
          <Input
            label="Description"
            type="text"
            value={creditDesc}
            onChange={(e) => setCreditDesc(e.target.value)}
            placeholder="e.g. Groceries on credit"
          />
        </div>
      </Modal>
    </div>
  )
}
