import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MoreHorizontal,
  Truck,
  Building2,
  Receipt,
  BarChart3,
  FileText,
  Settings,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const primaryNav = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/inventory', label: 'Stock', icon: Package },
  { to: '/sales', label: 'Sales', icon: ShoppingCart },
  { to: '/debtors', label: 'Khata', icon: Users },
]

const moreNav = [
  { to: '/purchases', label: 'Purchases', icon: Truck },
  { to: '/creditors', label: 'Creditors', icon: Building2 },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <>
      <nav className="bg-white border-t border-gray-200 flex items-center justify-around px-2 py-2">
        {primaryNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center px-3 py-1 rounded-lg min-w-0 transition-colors',
                isActive ? 'text-indigo-600' : 'text-gray-400'
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs mt-0.5 font-medium">{label}</span>
          </NavLink>
        ))}

        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center justify-center px-3 py-1 rounded-lg text-gray-400"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-xs mt-0.5 font-medium">More</span>
        </button>
      </nav>

      {/* More bottom sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMoreOpen(false)} />
          <div className="relative w-full bg-white rounded-t-2xl shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="font-semibold text-gray-900">More</p>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-px bg-gray-100 border-b border-gray-100">
              {moreNav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center gap-1.5 py-5 bg-white transition-colors',
                      isActive ? 'text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                    )
                  }
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{label}</span>
                </NavLink>
              ))}
            </div>
            <div className="h-6" />
          </div>
        </div>
      )}
    </>
  )
}
