import { useState } from 'react'
import { Settings, Trash2, RefreshCcw, Info } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'

const STORE_NAME_KEY = 'comunib_store_name'
const OWNER_NAME_KEY = 'comunib_owner_name'
const INITIALIZED_KEY = 'comunib_initialized'

export default function SettingsPage() {
  const [storeName, setStoreName] = useState(
    localStorage.getItem(STORE_NAME_KEY) || 'Muneeb Kirana Store'
  )
  const [ownerName, setOwnerName] = useState(
    localStorage.getItem(OWNER_NAME_KEY) || 'Muhammad Muneeb'
  )
  const [saved, setSaved] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)

  const handleSave = () => {
    localStorage.setItem(STORE_NAME_KEY, storeName)
    localStorage.setItem(OWNER_NAME_KEY, ownerName)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleResetDemo = () => {
    localStorage.removeItem(INITIALIZED_KEY)
    // Remove all data keys
    const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith('comunib_') && k !== STORE_NAME_KEY && k !== OWNER_NAME_KEY)
    keysToRemove.forEach((k) => localStorage.removeItem(k))
    setResetConfirm(false)
    window.location.reload()
  }

  const handleClearAll = () => {
    const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith('comunib_'))
    keysToRemove.forEach((k) => localStorage.removeItem(k))
    setClearConfirm(false)
    window.location.reload()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your store preferences</p>
      </div>

      {/* Store Profile */}
      <Card>
        <CardHeader title="Store Profile" subtitle="Your store details" />
        <div className="space-y-4">
          <Input
            label="Store Name"
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="e.g. Muneeb Kirana Store"
          />
          <Input
            label="Owner Name"
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="e.g. Muhammad Muneeb"
          />
          <Button onClick={handleSave} variant={saved ? 'success' : 'primary'}>
            {saved ? '✓ Saved!' : 'Save Changes'}
          </Button>
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader
          title="Data Management"
          subtitle="Manage your application data"
          action={<Trash2 className="w-5 h-5 text-red-400" />}
        />
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-amber-800">Reset Demo Data</p>
              <p className="text-xs text-amber-600 mt-0.5">Clears all data and reloads the original demo dataset.</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCcw className="w-4 h-4" />}
              onClick={() => setResetConfirm(true)}
            >
              Reset
            </Button>
          </div>

          <div className="flex items-start justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-red-800">Clear All Data</p>
              <p className="text-xs text-red-600 mt-0.5">Permanently deletes all data. Cannot be undone.</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => setClearConfirm(true)}
            >
              Clear All
            </Button>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card>
        <CardHeader
          title="About Co.Muneeb"
          action={<Info className="w-5 h-5 text-indigo-400" />}
        />
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Version</span>
            <span className="font-medium text-gray-900">0.1.0 — MVP</span>
          </div>
          <div className="flex justify-between">
            <span>Storage</span>
            <span className="font-medium text-gray-900">Browser localStorage (Demo)</span>
          </div>
          <div className="flex justify-between">
            <span>UI Framework</span>
            <span className="font-medium text-gray-900">React 18 + Vite + Tailwind CSS</span>
          </div>
          <div className="flex justify-between">
            <span>Charts</span>
            <span className="font-medium text-gray-900">Recharts</span>
          </div>
          <div className="flex justify-between">
            <span>Icons</span>
            <span className="font-medium text-gray-900">Lucide React</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
          <p className="text-xs text-indigo-600 font-medium">Co.Muneeb — Your Kirana Business, Clearly.</p>
          <p className="text-xs text-gray-500 mt-0.5">Built as a hackathon MVP to help small Kirana store owners manage their business digitally.</p>
        </div>
      </Card>

      {/* Reset Demo confirm */}
      <Modal
        open={resetConfirm}
        onClose={() => setResetConfirm(false)}
        title="Reset Demo Data"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetConfirm(false)}>Cancel</Button>
            <Button variant="secondary" icon={<RefreshCcw className="w-4 h-4" />} onClick={handleResetDemo}>
              Reset
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">This will clear all your data and reload the original demo dataset. Your recent transactions will be lost.</p>
      </Modal>

      {/* Clear All confirm */}
      <Modal
        open={clearConfirm}
        onClose={() => setClearConfirm(false)}
        title="Clear All Data"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setClearConfirm(false)}>Cancel</Button>
            <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={handleClearAll}>
              Delete Everything
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-red-600">This cannot be undone.</span> All products, sales, purchases, customers, suppliers, and expenses will be permanently deleted.
        </p>
      </Modal>
    </div>
  )
}
