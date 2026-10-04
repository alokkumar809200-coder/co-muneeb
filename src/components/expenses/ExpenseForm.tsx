import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { getDataLayer } from '@/lib/dataLayer'
import { todayISO } from '@/lib/utils'

const STORE_ID = 'seed-store-001'

const CATEGORIES = [
  { value: 'Rent', label: 'Rent' },
  { value: 'Electricity', label: 'Electricity' },
  { value: 'Salary', label: 'Salary' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Other', label: 'Other' },
]

interface ExpenseFormProps {
  onSaved: () => void
  onCancel: () => void
}

export default function ExpenseForm({ onSaved, onCancel }: ExpenseFormProps) {
  const [saving, setSaving] = useState(false)
  const [date, setDate] = useState(todayISO())
  const [category, setCategory] = useState('Other')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.')
      return
    }
    setSaving(true)
    try {
      await getDataLayer().addExpense({
        store_id: STORE_ID,
        expense_date: date,
        category,
        description,
        amount: Number(amount),
        payment_method: 'cash',
      })
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <Select
        label="Category"
        options={CATEGORIES}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <Input
        label="Amount (₹) *"
        type="number"
        min="1"
        prefix="₹"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
      />
      <Input
        label="Description (optional)"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g. Monthly shop rent"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1" loading={saving} onClick={handleSubmit}>Add Expense</Button>
      </div>
    </div>
  )
}
