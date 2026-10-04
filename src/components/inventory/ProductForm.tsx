import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { getDataLayer } from '@/lib/dataLayer'
import type { Product } from '@/types'

const STORE_ID = 'seed-store-001'

const CATEGORY_OPTIONS = [
  { value: 'Grains', label: 'Grains' },
  { value: 'Essentials', label: 'Essentials' },
  { value: 'Oils', label: 'Oils' },
  { value: 'Snacks', label: 'Snacks' },
  { value: 'Personal Care', label: 'Personal Care' },
  { value: 'Beverages', label: 'Beverages' },
  { value: 'Dairy', label: 'Dairy' },
  { value: 'Cleaning', label: 'Cleaning' },
  { value: 'Other', label: 'Other' },
]

const UNIT_OPTIONS = [
  { value: 'kg', label: 'kg' },
  { value: 'piece', label: 'piece' },
  { value: 'litre', label: 'litre' },
  { value: 'pack', label: 'pack' },
  { value: 'bottle', label: 'bottle' },
  { value: 'pkt', label: 'packet' },
  { value: 'box', label: 'box' },
  { value: 'bar', label: 'bar' },
  { value: 'btl', label: 'bottle' },
  { value: 'ltr', label: 'ltr' },
]

interface ProductFormProps {
  product?: Product
  onSaved: () => void
  onCancel: () => void
}

interface FormErrors {
  name?: string
  purchase_price?: string
  selling_price?: string
  current_stock?: string
}

export default function ProductForm({ product, onSaved, onCancel }: ProductFormProps) {
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [name, setName] = useState(product?.name ?? '')
  const [category, setCategory] = useState(product?.category ?? 'Essentials')
  const [purchasePrice, setPurchasePrice] = useState(String(product?.purchase_price ?? ''))
  const [sellingPrice, setSellingPrice] = useState(String(product?.selling_price ?? ''))
  const [currentStock, setCurrentStock] = useState(String(product?.current_stock ?? '0'))
  const [minStock, setMinStock] = useState(String(product?.min_stock_level ?? '10'))
  const [unit, setUnit] = useState(product?.unit ?? 'piece')
  const [brand, setBrand] = useState(product?.brand ?? '')
  const [sku, setSku] = useState(product?.sku ?? '')

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!name.trim()) errs.name = 'Product name is required'
    if (!purchasePrice || Number(purchasePrice) < 0) errs.purchase_price = 'Enter a valid price'
    if (!sellingPrice || Number(sellingPrice) < 0) errs.selling_price = 'Enter a valid price'
    if (currentStock === '' || Number(currentStock) < 0) errs.current_stock = 'Enter valid stock quantity'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const dl = getDataLayer()
      const data = {
        store_id: STORE_ID,
        name: name.trim(),
        category,
        category_id: undefined,
        purchase_price: Number(purchasePrice),
        selling_price: Number(sellingPrice),
        current_stock: Number(currentStock),
        min_stock_level: Number(minStock) || 10,
        unit,
        brand: brand.trim() || undefined,
        sku: sku.trim() || undefined,
      }
      if (product) {
        await dl.updateProduct(product.id, data)
      } else {
        await dl.addProduct(data)
      }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Input
        label="Product Name *"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="e.g. Tata Salt"
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Category"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Select
          label="Unit"
          options={UNIT_OPTIONS}
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Purchase Price (₹) *"
          type="number"
          min="0"
          step="0.01"
          prefix="₹"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          error={errors.purchase_price}
        />
        <Input
          label="Selling Price (₹) *"
          type="number"
          min="0"
          step="0.01"
          prefix="₹"
          value={sellingPrice}
          onChange={(e) => setSellingPrice(e.target.value)}
          error={errors.selling_price}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Current Stock"
          type="number"
          min="0"
          value={currentStock}
          onChange={(e) => setCurrentStock(e.target.value)}
          error={errors.current_stock}
        />
        <Input
          label="Min Stock Level"
          type="number"
          min="0"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
          hint="Alert when stock falls below this"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Brand (optional)"
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="e.g. Tata"
        />
        <Input
          label="SKU (optional)"
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="e.g. SALT001"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="flex-1" loading={saving} onClick={handleSubmit}>
          {product ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </div>
  )
}
