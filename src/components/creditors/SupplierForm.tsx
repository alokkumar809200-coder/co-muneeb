import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { getDataLayer } from '@/lib/dataLayer'
import type { Supplier } from '@/types'

const STORE_ID = 'seed-store-001'

interface SupplierFormProps {
  supplier?: Supplier
  onSaved: () => void
  onCancel: () => void
}

export default function SupplierForm({ supplier, onSaved, onCancel }: SupplierFormProps) {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(supplier?.name ?? '')
  const [phone, setPhone] = useState(supplier?.mobile ?? '')
  const [openingBalance, setOpeningBalance] = useState(String(supplier?.opening_balance ?? '0'))
  const [errors, setErrors] = useState<{ name?: string }>({})

  const validate = () => {
    const errs: { name?: string } = {}
    if (!name.trim()) errs.name = 'Supplier name is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const dl = getDataLayer()
      const balance = Number(openingBalance) || 0
      if (supplier) {
        await dl.updateSupplier(supplier.id, {
          name: name.trim(),
          mobile: phone.trim(),
          opening_balance: balance,
        })
      } else {
        await dl.addSupplier({
          store_id: STORE_ID,
          name: name.trim(),
          mobile: phone.trim(),
          opening_balance: balance,
          current_balance: balance,
        })
      }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Input
        label="Supplier Name *"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="e.g. Sharma Wholesale"
      />
      <Input
        label="Mobile Number"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="e.g. 9876543210"
      />
      <Input
        label="Opening Balance (₹)"
        type="number"
        min="0"
        prefix="₹"
        value={openingBalance}
        onChange={(e) => setOpeningBalance(e.target.value)}
        hint="Amount already owed before tracking starts"
      />
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1" loading={saving} onClick={handleSubmit}>
          {supplier ? 'Update' : 'Add Supplier'}
        </Button>
      </div>
    </div>
  )
}
