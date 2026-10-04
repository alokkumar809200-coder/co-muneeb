import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, Truck, Users, Building2, Receipt, CheckCircle } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { getDataLayer } from '@/lib/dataLayer'
import { formatCurrency, todayISO, generateId } from '@/lib/utils'
import type { Product, Customer, Supplier } from '@/types'

interface QuickEntryModalProps {
  open: boolean
  onClose: () => void
}

type Tab = 'sale' | 'purchase' | 'customerPayment' | 'supplierPayment' | 'expense'

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'sale', label: 'Sale', icon: ShoppingCart },
  { id: 'purchase', label: 'Purchase', icon: Truck },
  { id: 'customerPayment', label: 'Customer Pay', icon: Users },
  { id: 'supplierPayment', label: 'Supplier Pay', icon: Building2 },
  { id: 'expense', label: 'Expense', icon: Receipt },
]

const STORE_ID = 'seed-store-001'

const EXPENSE_CATEGORIES = [
  { value: 'Rent', label: 'Rent' },
  { value: 'Electricity', label: 'Electricity' },
  { value: 'Salary', label: 'Salary' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Other', label: 'Other' },
]

export default function QuickEntryModal({ open, onClose }: QuickEntryModalProps) {
  const [tab, setTab] = useState<Tab>('sale')
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Sale form
  const [saleProductId, setSaleProductId] = useState('')
  const [saleQty, setSaleQty] = useState('1')
  const [salePayment, setSalePayment] = useState<'cash' | 'upi' | 'credit'>('cash')
  const [saleCustomerId, setSaleCustomerId] = useState('')

  // Purchase form
  const [purSupplierId, setPurSupplierId] = useState('')
  const [purProductId, setPurProductId] = useState('')
  const [purQty, setPurQty] = useState('1')
  const [purPrice, setPurPrice] = useState('')
  const [purPayment, setPurPayment] = useState<'cash' | 'upi' | 'credit'>('cash')

  // Customer payment
  const [cpCustomerId, setCpCustomerId] = useState('')
  const [cpAmount, setCpAmount] = useState('')

  // Supplier payment
  const [spSupplierId, setSpSupplierId] = useState('')
  const [spAmount, setSpAmount] = useState('')

  // Expense
  const [expCategory, setExpCategory] = useState('Other')
  const [expAmount, setExpAmount] = useState('')
  const [expDesc, setExpDesc] = useState('')

  const load = useCallback(async () => {
    const dl = getDataLayer()
    const [p, c, s] = await Promise.all([dl.getProducts(), dl.getCustomers(), dl.getSuppliers()])
    setProducts(p)
    setCustomers(c)
    setSuppliers(s)
  }, [])

  useEffect(() => {
    if (open) {
      load()
      setSuccess(false)
    }
  }, [open, load])

  const selectedProduct = products.find((p) => p.id === saleProductId)
  const saleTotal = selectedProduct ? selectedProduct.selling_price * (Number(saleQty) || 0) : 0

  const selectedPurProduct = products.find((p) => p.id === purProductId)
  const purTotal = Number(purPrice || selectedPurProduct?.purchase_price || 0) * (Number(purQty) || 0)

  const handleSave = async () => {
    setSaving(true)
    try {
      const dl = getDataLayer()
      if (tab === 'sale') {
        if (!saleProductId || !saleQty) return
        const product = products.find((p) => p.id === saleProductId)!
        const qty = Number(saleQty)
        const total = product.selling_price * qty
        await dl.addSale(
          {
            store_id: STORE_ID,
            customer_id: salePayment === 'credit' ? saleCustomerId || undefined : undefined,
            customer_name: salePayment === 'credit' ? customers.find((c) => c.id === saleCustomerId)?.name : undefined,
            sale_date: todayISO(),
            total_amount: total,
            discount: 0,
            payment_method: salePayment,
          },
          [
            {
              product_id: saleProductId,
              product_name: product.name,
              quantity: qty,
              unit_price: product.selling_price,
              cost_price: product.purchase_price,
              total_price: total,
            },
          ]
        )
      } else if (tab === 'purchase') {
        if (!purProductId || !purQty) return
        const product = products.find((p) => p.id === purProductId)!
        const qty = Number(purQty)
        const price = Number(purPrice) || product.purchase_price
        const total = price * qty
        await dl.addPurchase(
          {
            store_id: STORE_ID,
            supplier_id: purSupplierId || undefined,
            supplier_name: suppliers.find((s) => s.id === purSupplierId)?.name,
            purchase_date: todayISO(),
            total_amount: total,
            payment_status: purPayment === 'credit' ? 'credit' : 'paid',
          },
          [
            {
              product_id: purProductId,
              product_name: product.name,
              quantity: qty,
              unit_price: price,
              total_price: total,
            },
          ]
        )
      } else if (tab === 'customerPayment') {
        if (!cpCustomerId || !cpAmount) return
        const customer = customers.find((c) => c.id === cpCustomerId)!
        await dl.addCustomerTransaction({
          store_id: STORE_ID,
          customer_id: cpCustomerId,
          transaction_date: todayISO(),
          description: 'Payment received',
          debit_amount: 0,
          credit_amount: Number(cpAmount),
          balance: -Number(cpAmount),
          transaction_type: 'credit',
        })
        void customer
      } else if (tab === 'supplierPayment') {
        if (!spSupplierId || !spAmount) return
        await dl.addSupplierTransaction({
          store_id: STORE_ID,
          supplier_id: spSupplierId,
          transaction_date: todayISO(),
          description: 'Payment made',
          debit_amount: Number(spAmount),
          credit_amount: 0,
          balance: -Number(spAmount),
          transaction_type: 'debit',
        })
      } else if (tab === 'expense') {
        if (!expAmount) return
        await dl.addExpense({
          store_id: STORE_ID,
          expense_date: todayISO(),
          category: expCategory,
          description: expDesc,
          amount: Number(expAmount),
          payment_method: 'cash',
        })
      }
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1000)
    } finally {
      setSaving(false)
    }
  }

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.name} (Stock: ${p.current_stock} ${p.unit})`,
  }))

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: `${c.name} — ${formatCurrency(c.current_balance)} due`,
  }))

  const supplierOptions = suppliers.map((s) => ({
    value: s.id,
    label: `${s.name} — ${formatCurrency(s.current_balance)} payable`,
  }))

  return (
    <Modal open={open} onClose={onClose} title="Quick Add" size="md">
      {success ? (
        <div className="flex flex-col items-center py-8 gap-3">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
          <p className="text-base font-semibold text-gray-900">Saved!</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  tab === id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Sale Tab */}
          {tab === 'sale' && (
            <div className="space-y-3">
              <Select
                label="Product"
                options={productOptions}
                placeholder="Select product"
                value={saleProductId}
                onChange={(e) => setSaleProductId(e.target.value)}
              />
              <Input
                label="Quantity"
                type="number"
                min="1"
                value={saleQty}
                onChange={(e) => setSaleQty(e.target.value)}
              />
              <Select
                label="Payment"
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'upi', label: 'UPI' },
                  { value: 'credit', label: 'Credit' },
                ]}
                value={salePayment}
                onChange={(e) => setSalePayment(e.target.value as 'cash' | 'upi' | 'credit')}
              />
              {salePayment === 'credit' && (
                <Select
                  label="Customer"
                  options={customerOptions}
                  placeholder="Select customer"
                  value={saleCustomerId}
                  onChange={(e) => setSaleCustomerId(e.target.value)}
                />
              )}
              {saleTotal > 0 && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                  <p className="text-sm font-semibold text-emerald-700">Total: {formatCurrency(saleTotal)}</p>
                </div>
              )}
            </div>
          )}

          {/* Purchase Tab */}
          {tab === 'purchase' && (
            <div className="space-y-3">
              <Select
                label="Supplier (optional)"
                options={supplierOptions}
                placeholder="Select supplier"
                value={purSupplierId}
                onChange={(e) => setPurSupplierId(e.target.value)}
              />
              <Select
                label="Product"
                options={productOptions}
                placeholder="Select product"
                value={purProductId}
                onChange={(e) => {
                  setPurProductId(e.target.value)
                  const p = products.find((x) => x.id === e.target.value)
                  if (p) setPurPrice(String(p.purchase_price))
                }}
              />
              <Input
                label="Quantity"
                type="number"
                min="1"
                value={purQty}
                onChange={(e) => setPurQty(e.target.value)}
              />
              <Input
                label="Purchase Price (₹)"
                type="number"
                min="0"
                prefix="₹"
                value={purPrice}
                onChange={(e) => setPurPrice(e.target.value)}
              />
              <Select
                label="Payment"
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'upi', label: 'UPI' },
                  { value: 'credit', label: 'Credit' },
                ]}
                value={purPayment}
                onChange={(e) => setPurPayment(e.target.value as 'cash' | 'upi' | 'credit')}
              />
              {purTotal > 0 && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                  <p className="text-sm font-semibold text-blue-700">Total: {formatCurrency(purTotal)}</p>
                </div>
              )}
            </div>
          )}

          {/* Customer Payment Tab */}
          {tab === 'customerPayment' && (
            <div className="space-y-3">
              <Select
                label="Customer"
                options={customerOptions}
                placeholder="Select customer"
                value={cpCustomerId}
                onChange={(e) => setCpCustomerId(e.target.value)}
              />
              <Input
                label="Amount (₹)"
                type="number"
                min="1"
                prefix="₹"
                value={cpAmount}
                onChange={(e) => setCpAmount(e.target.value)}
              />
            </div>
          )}

          {/* Supplier Payment Tab */}
          {tab === 'supplierPayment' && (
            <div className="space-y-3">
              <Select
                label="Supplier"
                options={supplierOptions}
                placeholder="Select supplier"
                value={spSupplierId}
                onChange={(e) => setSpSupplierId(e.target.value)}
              />
              <Input
                label="Amount (₹)"
                type="number"
                min="1"
                prefix="₹"
                value={spAmount}
                onChange={(e) => setSpAmount(e.target.value)}
              />
            </div>
          )}

          {/* Expense Tab */}
          {tab === 'expense' && (
            <div className="space-y-3">
              <Select
                label="Category"
                options={EXPENSE_CATEGORIES}
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value)}
              />
              <Input
                label="Amount (₹)"
                type="number"
                min="1"
                prefix="₹"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
              />
              <Input
                label="Description (optional)"
                type="text"
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>
              Save
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
