import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Users, Plus, Phone } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import SearchBar from '@/components/ui/SearchBar'
import EmptyState from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import Input from '@/components/ui/Input'
import CustomerForm from '@/components/debtors/CustomerForm'
import { getDataLayer } from '@/lib/dataLayer'
import { formatCurrency, generateId, todayISO } from '@/lib/utils'
import type { Customer } from '@/types'

const STORE_ID = 'seed-store-001'

function getStatus(balance: number): { label: string; variant: 'success' | 'warning' | 'danger' } {
  if (balance <= 0) return { label: 'Paid', variant: 'success' }
  return { label: 'Pending', variant: 'warning' }
}

export default function DebtorsPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentSaving, setPaymentSaving] = useState(false)
  const [creditCustomer, setCreditCustomer] = useState<Customer | null>(null)
  const [creditAmount, setCreditAmount] = useState('')
  const [creditDesc, setCreditDesc] = useState('')
  const [creditSaving, setCreditSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setCustomers(await getDataLayer().getCustomers())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const totalReceivable = customers.reduce((s, c) => s + Math.max(0, c.current_balance), 0)

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.mobile ?? '').includes(search)
  )

  const handleRecordPayment = async () => {
    if (!paymentCustomer || !paymentAmount) return
    setPaymentSaving(true)
    try {
      await getDataLayer().addCustomerTransaction({
        store_id: STORE_ID,
        customer_id: paymentCustomer.id,
        transaction_date: todayISO(),
        description: 'Payment received',
        debit_amount: 0,
        credit_amount: Number(paymentAmount),
        balance: -Number(paymentAmount),
        transaction_type: 'credit',
      })
      setPaymentCustomer(null)
      setPaymentAmount('')
      load()
    } finally {
      setPaymentSaving(false)
    }
  }

  const handleAddCredit = async () => {
    if (!creditCustomer || !creditAmount) return
    setCreditSaving(true)
    try {
      await getDataLayer().addCustomerTransaction({
        store_id: STORE_ID,
        customer_id: creditCustomer.id,
        transaction_date: todayISO(),
        description: creditDesc || 'Credit added',
        debit_amount: Number(creditAmount),
        credit_amount: 0,
        balance: Number(creditAmount),
        transaction_type: 'debit',
      })
      setCreditCustomer(null)
      setCreditAmount('')
      setCreditDesc('')
      load()
    } finally {
      setCreditSaving(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Debtors (Customer Khata)</h1>
          <p className="text-sm text-gray-500">{customers.length} customers</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>
          Add Customer
        </Button>
      </div>

      {/* Total receivables card */}
      <div className={`rounded-xl border p-5 ${totalReceivable > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
        <p className="text-sm text-gray-500 mb-1">Total Receivables</p>
        <p className={`text-3xl font-bold ${totalReceivable > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
          {formatCurrency(totalReceivable)}
        </p>
        <p className="text-xs text-gray-400 mt-1">Amount owed to you by all customers</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search customers..." className="max-w-sm" />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-7 h-7" />}
          title="No customers found"
          description="Add a customer to start tracking their credit."
          action={{ label: 'Add Customer', onClick: () => setAddOpen(true) }}
        />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Outstanding</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => {
                  const { label, variant } = getStatus(c.current_balance)
                  return (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link to={`/debtors/${c.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{c.mobile || '—'}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${c.current_balance > 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                        {formatCurrency(Math.max(0, c.current_balance))}
                      </td>
                      <td className="px-4 py-3 text-center"><Badge variant={variant}>{label}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => { setPaymentCustomer(c); setPaymentAmount('') }}
                          >
                            Record Payment
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => { setCreditCustomer(c); setCreditAmount(''); setCreditDesc('') }}
                          >
                            Add Credit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {filtered.map((c) => {
              const { label, variant } = getStatus(c.current_balance)
              return (
                <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Link to={`/debtors/${c.id}`} className="font-semibold text-gray-900 hover:text-indigo-600">
                        {c.name}
                      </Link>
                      {c.mobile && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {c.mobile}
                        </div>
                      )}
                    </div>
                    <Badge variant={variant}>{label}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-bold ${c.current_balance > 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {formatCurrency(Math.max(0, c.current_balance))}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="success" onClick={() => { setPaymentCustomer(c); setPaymentAmount('') }}>
                        Pay
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => { setCreditCustomer(c); setCreditAmount('') }}>
                        Credit
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Add customer modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Customer" size="md">
        <CustomerForm onSaved={() => { setAddOpen(false); load() }} onCancel={() => setAddOpen(false)} />
      </Modal>

      {/* Record payment modal */}
      <Modal
        open={!!paymentCustomer}
        onClose={() => setPaymentCustomer(null)}
        title="Record Payment"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPaymentCustomer(null)}>Cancel</Button>
            <Button variant="success" loading={paymentSaving} onClick={handleRecordPayment}>Record</Button>
          </>
        }
      >
        {paymentCustomer && (
          <div className="space-y-3">
            <div className="bg-amber-50 rounded-lg px-3 py-2">
              <p className="text-sm font-medium text-amber-800">{paymentCustomer.name}</p>
              <p className="text-xs text-amber-600">Outstanding: {formatCurrency(Math.max(0, paymentCustomer.current_balance))}</p>
            </div>
            <Input
              label="Amount (₹)"
              type="number"
              min="1"
              prefix="₹"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter amount received"
            />
          </div>
        )}
      </Modal>

      {/* Add credit modal */}
      <Modal
        open={!!creditCustomer}
        onClose={() => setCreditCustomer(null)}
        title="Add Credit"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreditCustomer(null)}>Cancel</Button>
            <Button loading={creditSaving} onClick={handleAddCredit}>Add Credit</Button>
          </>
        }
      >
        {creditCustomer && (
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg px-3 py-2">
              <p className="text-sm font-medium text-blue-800">{creditCustomer.name}</p>
            </div>
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
        )}
      </Modal>
    </div>
  )
}
