import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { getDataLayer } from '@/lib/dataLayer'
import { formatCurrency, todayISO, generateId } from '@/lib/utils'
import type { Product, Customer } from '@/types'

const STORE_ID = 'seed-store-001'

interface LineItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  cost_price: number
}

interface SaleFormProps {
  onSaved: () => void
  onCancel: () => void
}

export default function SaleForm({ onSaved, onCancel }: SaleFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [saving, setSaving] = useState(false)

  const [saleDate, setSaleDate] = useState(todayISO())
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'credit'>('cash')
  const [customerId, setCustomerId] = useState('')
  const [lines, setLines] = useState<LineItem[]>([
    { id: generateId(), product_id: '', quantity: 1, unit_price: 0, cost_price: 0 },
  ])
  const [error, setError] = useState('')

  useEffect(() => {
    const dl = getDataLayer()
    Promise.all([dl.getProducts(), dl.getCustomers()]).then(([p, c]) => {
      setProducts(p)
      setCustomers(c)
    })
  }, [])

  const updateLine = (id: string, patch: Partial<LineItem>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  const selectProduct = (lineId: string, productId: string) => {
    const product = products.find((p) => p.id === productId)
    updateLine(lineId, {
      product_id: productId,
      unit_price: product?.selling_price ?? 0,
      cost_price: product?.purchase_price ?? 0,
    })
  }

  const addLine = () => {
    setLines((prev) => [...prev, { id: generateId(), product_id: '', quantity: 1, unit_price: 0, cost_price: 0 }])
  }

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }

  const grandTotal = lines.reduce((s, l) => s + l.unit_price * l.quantity, 0)
  const totalCOGS = lines.reduce((s, l) => s + l.cost_price * l.quantity, 0)
  const grossProfit = grandTotal - totalCOGS

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.current_stock} ${p.unit})`,
  }))

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const handleSubmit = async () => {
    setError('')
    if (lines.some((l) => !l.product_id)) {
      setError('Please select a product for all line items.')
      return
    }
    if (lines.some((l) => l.quantity <= 0)) {
      setError('All quantities must be greater than zero.')
      return
    }
    if (paymentMethod === 'credit' && !customerId) {
      setError('Please select a customer for credit sales.')
      return
    }

    setSaving(true)
    try {
      const dl = getDataLayer()
      const customer = customers.find((c) => c.id === customerId)
      await dl.addSale(
        {
          store_id: STORE_ID,
          customer_id: paymentMethod === 'credit' ? customerId || undefined : undefined,
          customer_name: paymentMethod === 'credit' ? customer?.name : undefined,
          sale_date: saleDate,
          total_amount: grandTotal,
          discount: 0,
          payment_method: paymentMethod,
        },
        lines.map((l) => {
          const p = products.find((x) => x.id === l.product_id)!
          return {
            product_id: l.product_id,
            product_name: p?.name,
            quantity: l.quantity,
            unit_price: l.unit_price,
            cost_price: l.cost_price,
            total_price: l.unit_price * l.quantity,
          }
        })
      )
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Date"
          type="date"
          value={saleDate}
          onChange={(e) => setSaleDate(e.target.value)}
        />
        <Select
          label="Payment Method"
          options={[
            { value: 'cash', label: 'Cash' },
            { value: 'upi', label: 'UPI' },
            { value: 'credit', label: 'Credit (Khata)' },
          ]}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'upi' | 'credit')}
        />
      </div>

      {paymentMethod === 'credit' && (
        <Select
          label="Customer *"
          options={customerOptions}
          placeholder="Select customer"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        />
      )}

      {/* Line Items */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Products</label>
        <div className="space-y-2">
          {lines.map((line, idx) => {
            const product = products.find((p) => p.id === line.product_id)
            return (
              <div key={line.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Product</label>}
                  <select
                    value={line.product_id}
                    onChange={(e) => selectProduct(line.id, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.current_stock} {p.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Qty</label>}
                  <input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) => updateLine(line.id, { quantity: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Price (₹)</label>}
                  <input
                    type="number"
                    min="0"
                    value={line.unit_price}
                    onChange={(e) => updateLine(line.id, { unit_price: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Total</label>}
                  <div className="py-2 px-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
                    {formatCurrency(line.unit_price * line.quantity)}
                  </div>
                </div>
                <div className="col-span-1 flex items-end pb-0.5">
                  {lines.length > 1 && (
                    <button
                      onClick={() => removeLine(line.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <button
          onClick={addLine}
          className="mt-2 flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add item
        </button>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Grand Total</span>
          <span className="font-bold text-gray-900">{formatCurrency(grandTotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">COGS</span>
          <span className="text-gray-700">{formatCurrency(totalCOGS)}</span>
        </div>
        <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
          <span className="text-gray-500">Est. Gross Profit</span>
          <span className={`font-semibold ${grossProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(grossProfit)}
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1" loading={saving} onClick={handleSubmit}>Record Sale</Button>
      </div>
    </div>
  )
}
