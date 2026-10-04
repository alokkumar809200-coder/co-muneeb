import { useState } from 'react'
import { Bell, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import QuickEntryModal from '@/components/quick-entry/QuickEntryModal'

const DEMO_ALERTS = [
  '5 products are low on stock.',
  '₹3,100 is pending from customers.',
  'Sales are up compared to last week.',
]

export default function TopBar() {
  const [quickOpen, setQuickOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 z-10">
        {/* Mobile brand */}
        <div className="flex items-center lg:hidden">
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center mr-2">
            <span className="text-white text-xs font-bold">CM</span>
          </div>
          <span className="text-sm font-bold text-gray-900">Co.Muneeb</span>
          <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
            Demo
          </span>
        </div>

        {/* Desktop left */}
        <div className="hidden lg:flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Muneeb Kirana Store</span>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            Demo Mode
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setQuickOpen(true)}
            className="hidden sm:inline-flex"
          >
            Quick Add
          </Button>

          {/* Bell */}
          <div className="relative">
            <button
              onClick={() => setBellOpen(!bellOpen)}
              className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {bellOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBellOpen(false)} />
                <div className={cn(
                  'absolute right-0 top-full mt-1 w-72 bg-white rounded-xl border border-gray-200 shadow-lg z-20 overflow-hidden'
                )}>
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">Alerts</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {DEMO_ALERTS.map((alert, i) => (
                      <div key={i} className="px-4 py-3">
                        <p className="text-xs text-gray-600">{alert}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-600" />
          </div>
        </div>
      </header>

      {/* Mobile FAB */}
      <button
        onClick={() => setQuickOpen(true)}
        className="sm:hidden fixed bottom-20 right-4 z-30 w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors"
        aria-label="Quick Add"
      >
        <Plus className="w-5 h-5" />
      </button>

      <QuickEntryModal open={quickOpen} onClose={() => setQuickOpen(false)} />
    </>
  )
}
