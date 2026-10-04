import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Plus, Phone } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import SearchBar from '@/components/ui/SearchBar'
import EmptyState from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import Input from '@/components/ui/Input'
import SupplierForm from '@/components/creditors/SupplierForm'
import { getDataLayer } from '@/lib/dataLayer'
import { formatCurrency, generateId, todayISO } from '@/lib/utils'
import type { Supplier } from '@/types'

const STORE_ID = 'seed-store-001'

function getStatus(balance: number): { label: string; variant: 'success' | 'danger' | 'warning' } {
  if (balance <= 0) return { label: 'Cleared', variant: 'success' }
  return { label: 'Due', variant: 'danger' }
}

export default function CreditorsPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [paymentSupplier, setPaymentSupplier] = useState<Supplier | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentSaving, setPaymentSaving] = useState(false)
  const [creditSupplier, setCreditSupplier] = useState<Supplier | null>(null)
  const [creditAmount, setCreditAmount] = useState('')
  const [creditDesc, setCreditDesc] = useState('')
  const [creditSaving, setCreditSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setSuppliers(await getDataLayer().getSuppliers())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const totalPayable = suppliers.reduce((s, sup) => s + Math.max(0, sup.current_balance), 0)

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.mobile ?? '').includes(search)
  )

  const handlePayment = async () => {
    if (!paymentSupplier || !paymentAmount) return
    setPaymentSaving(true)
    try {
      await getDataLayer().addSupplierTransaction({
        store_id: STORE_ID,
        supplier_id: paymentSupplier.id,
        transaction_date: todayISO(),
        description: 'Payment made',
        debit_amount: Number(paymentAmount),
        credit_amount: 0,
        balance: -Number(paymentAmount),
        transaction_type: 'debit',
      })
      setPaymentSupplier(null)
      setPaymentAmount('')
      load()
    } finally {
      setPaymentSaving(false)
    }
  }

  const handleAddCredit = async () => {
    if (!creditSupplier || !creditAmount) return
    setCreditSaving(true)
    try {
      await getDataLayer().addSupplierTransaction({
        store_id: STORE_ID,
        supplier_id: creditSupplier.id,
        transaction_date: todayISO(),
        description: creditDesc || 'Credit purchase',
        debit_amount: 0,
        credit_amount: Number(creditAmount),
        balance: Number(creditAmount),
        transaction_type: 'credit',
      })
      setCreditSupplier(null)
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
          <h1 className="text-2xl font-bold text-gray-900">Creditors (Suppliers)</h1>
          <p className="text-sm text-gray-500">{suppliers.length} suppliers</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>
          Add Supplier
        </Button>
      </div>

      {/* Total payables card */}
      <div className={`rounded-xl border p-5 ${totalPayable > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
        <p className="text-sm text-gray-500 mb-1">Total Payables</p>
        <p className={`text-3xl font-bold ${totalPayable > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
          {formatCurrency(totalPayable)}
        </p>
        <p className="text-xs text-gray-400 mt-1">Amount you owe to all suppliers</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search suppliers..." className="max-w-sm" />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-7 h-7" />}
          title="No suppliers found"
          description="Add a supplier to track credit purchases."
          action={{ label: 'Add Supplier', onClick: () => setAddOpen(true) }}
        />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Outstanding</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s) => {
                  const { label, variant } = getStatus(s.current_balance)
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link to={`/creditors/${s.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                          {s.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{s.mobile || '—'}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${s.current_balance > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {formatCurrency(Math.max(0, s.current_balance))}
                      </td>
                      <td className="px-4 py-3 text-center"><Badge variant={variant}>{label}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button size="sm" variant="success" onClick={() => { setPaymentSupplier(s); setPaymentAmount('') }}>
                            Record Payment
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => { setCreditSupplier(s); setCreditAmount('') }}>
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

          <div className="md:hidden space-y-3">
            {filtered.map((s) => {
              const { label, variant } = getStatus(s.current_balance)
              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Link to={`/creditors/${s.id}`} className="font-semibold text-gray-900 hover:text-indigo-600">
                        {s.name}
                      </Link>
                      {s.mobile && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <Phone className="w-3 h-3" />{s.mobile}
                        </div>
                      )}
                    </div>
                    <Badge variant={variant}>{label}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-bold ${s.current_balance > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {formatCurrency(Math.max(0, s.current_balance))}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="success" onClick={() => { setPaymentSupplier(s); setPaymentAmount('') }}>Pay</Button>
                      <Button size="sm" variant="secondary" onClick={() => { setCreditSupplier(s); setCreditAmount('') }}>Credit</Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Supplier" size="md">
        <SupplierForm onSaved={() => { setAddOpen(false); load() }} onCancel={() => setAddOpen(false)} />
      </Modal>

      <Modal
        open={!!paymentSupplier}
        onClose={() => setPaymentSupplier(null)}
        title="Record Payment"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPaymentSupplier(null)}>Cancel</Button>
            <Button variant="success" loading={paymentSaving} onClick={handlePayment}>Record</Button>
          </>
        }
      >
        {paymentSupplier && (
          <div className="space-y-3">
            <div className="bg-red-50 rounded-lg px-3 py-2">
              <p className="text-sm font-medium text-red-800">{paymentSupplier.name}</p>
              <p className="text-xs text-red-600">Outstanding: {formatCurrency(Math.max(0, paymentSupplier.current_balance))}</p>
            </div>
            <Input
              label="Amount Paid (₹)"
              type="number"
              min="1"
              prefix="₹"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={!!creditSupplier}
        onClose={() => setCreditSupplier(null)}
        title="Add Credit Purchase"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreditSupplier(null)}>Cancel</Button>
            <Button loading={creditSaving} onClick={handleAddCredit}>Add Credit</Button>
          </>
        }
      >
        {creditSupplier && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-sm font-medium text-gray-800">{creditSupplier.name}</p>
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
              placeholder="e.g. Rice purchase on credit"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
