import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { getDataLayer } from '@/lib/dataLayer'
import { formatCurrency, todayISO, generateId } from '@/lib/utils'
import type { Product, Supplier } from '@/types'

const STORE_ID = 'seed-store-001'

interface PurchaseLineItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
}

interface PurchaseFormProps {
  onSaved: () => void
  onCancel: () => void
}

export default function PurchaseForm({ onSaved, onCancel }: PurchaseFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [purchaseDate, setPurchaseDate] = useState(todayISO())
  const [supplierId, setSupplierId] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'credit' | 'partial'>('paid')
  const [lines, setLines] = useState<PurchaseLineItem[]>([
    { id: generateId(), product_id: '', quantity: 1, unit_price: 0 },
  ])

  useEffect(() => {
    const dl = getDataLayer()
    Promise.all([dl.getProducts(), dl.getSuppliers()]).then(([p, s]) => {
      setProducts(p)
      setSuppliers(s)
    })
  }, [])

  const updateLine = (id: string, patch: Partial<PurchaseLineItem>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  const selectProduct = (lineId: string, productId: string) => {
    const product = products.find((p) => p.id === productId)
    updateLine(lineId, {
      product_id: productId,
      unit_price: product?.purchase_price ?? 0,
    })
  }

  const addLine = () => {
    setLines((prev) => [...prev, { id: generateId(), product_id: '', quantity: 1, unit_price: 0 }])
  }

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }

  const grandTotal = lines.reduce((s, l) => s + l.unit_price * l.quantity, 0)

  const handleSubmit = async () => {
    setError('')
    if (lines.some((l) => !l.product_id)) {
      setError('Please select a product for all items.')
      return
    }
    if (lines.some((l) => l.quantity <= 0)) {
      setError('All quantities must be greater than zero.')
      return
    }
    setSaving(true)
    try {
      await getDataLayer().addPurchase(
        {
          store_id: STORE_ID,
          supplier_id: supplierId || undefined,
          supplier_name: suppliers.find((s) => s.id === supplierId)?.name,
          purchase_date: purchaseDate,
          total_amount: grandTotal,
          payment_status: paymentStatus,
        },
        lines.map((l) => {
          const p = products.find((x) => x.id === l.product_id)!
          return {
            product_id: l.product_id,
            product_name: p?.name,
            quantity: l.quantity,
            unit_price: l.unit_price,
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
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
        />
        <Select
          label="Payment Status"
          options={[
            { value: 'paid', label: 'Paid' },
            { value: 'credit', label: 'Credit (Udhar)' },
            { value: 'partial', label: 'Partial' },
          ]}
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value as 'paid' | 'credit' | 'partial')}
        />
      </div>

      <Select
        label="Supplier (optional)"
        options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
        placeholder="Select supplier"
        value={supplierId}
        onChange={(e) => setSupplierId(e.target.value)}
      />

      {/* Line Items */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
        <div className="space-y-2">
          {lines.map((line, idx) => (
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
                    <option key={p.id} value={p.id}>{p.name}</option>
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
                  <button onClick={() => removeLine(line.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addLine}
          className="mt-2 flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add item
        </button>
      </div>

      {grandTotal > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Grand Total</span>
            <span className="font-bold text-gray-900">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1" loading={saving} onClick={handleSubmit}>Record Purchase</Button>
      </div>
    </div>
  )
}
