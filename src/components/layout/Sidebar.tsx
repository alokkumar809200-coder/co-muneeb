import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Building2,
  Receipt,
  BarChart3,
  FileText,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/sales', label: 'Sales', icon: ShoppingCart },
  { to: '/purchases', label: 'Purchases', icon: Truck },
  { to: '/debtors', label: 'Debtors (Khata)', icon: Users },
  { to: '/creditors', label: 'Creditors', icon: Building2 },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      {/* Brand */}
      <div className="flex items-center px-6 py-5 border-b border-gray-200">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mr-3">
          <span className="text-white text-xs font-bold">CM</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Co.Muneeb</p>
          <p className="text-xs text-gray-500">Kirana Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )
            }
          >
            <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">Demo Mode — localStorage</p>
      </div>
    </div>
  )
}
