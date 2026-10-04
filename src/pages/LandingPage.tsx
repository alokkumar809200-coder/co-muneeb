import { Link } from 'react-router-dom'
import {
  Package,
  TrendingUp,
  Users,
  Building2,
  BarChart3,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Brain,
  Smartphone,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">CM</span>
            </div>
            <span className="text-base font-bold text-gray-900">Co.Muneeb</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hidden sm:block text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hidden sm:block text-sm text-gray-500 hover:text-gray-900 transition-colors">
              How It Works
            </a>
            <Link
              to="/dashboard"
              className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Dashboard →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-indigo-700">Demo data loaded — start exploring</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-5">
          Run Your Kirana Business
          <br />
          <span className="text-indigo-600">With Clarity.</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-8">
          Track sales, stock, credit, expenses and profits in one simple dashboard — built for Indian Kirana stores.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition-colors text-base flex items-center justify-center gap-2"
          >
            Start Managing Your Store
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto bg-white text-gray-700 font-semibold px-8 py-3.5 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors text-base"
          >
            View Demo
          </Link>
        </div>

        {/* Hero visual */}
        <div className="mt-14 bg-gradient-to-b from-indigo-50 to-white rounded-2xl border border-indigo-100 p-6 sm:p-10 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Today's Sales", value: '₹4,250', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Monthly Sales', value: '₹1,24,800', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Inventory Value', value: '₹89,320', color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Total Receivables', value: '₹3,100', color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4 text-left`}>
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`text-lg font-bold ${color} mt-1`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">The Problem</h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Kirana businesses often depend on notebooks, memory and manual calculations.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: <BookOpen className="w-6 h-6" />,
                title: 'Notebook Management',
                desc: 'Sales, purchases and credit tracked in physical registers — hard to search, easy to lose.',
              },
              {
                icon: <Brain className="w-6 h-6" />,
                title: 'Memory-Based Credit',
                desc: 'Customer outstanding balances kept in memory — disputes arise, payments get forgotten.',
              },
              {
                icon: <Package className="w-6 h-6" />,
                title: 'Unclear Stock Levels',
                desc: 'No system for low-stock alerts — running out of popular items hurts revenue.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
                  {icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">The Solution</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-10">
            Co.Muneeb converts everyday store records into clear business insights — no accounting knowledge needed.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">Everything Your Store Needs</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Package className="w-6 h-6" />,
                title: 'Smart Inventory',
                desc: 'Track stock levels in real time. Get alerts when products run low. Never run out of top sellers.',
                color: 'bg-indigo-50 text-indigo-600',
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: 'Sales Tracking',
                desc: 'Record sales in seconds. Track revenue, profit margins and top products automatically.',
                color: 'bg-emerald-50 text-emerald-600',
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Customer Khata',
                desc: 'Digital ledger for every customer. Track credit, payments and outstanding balances easily.',
                color: 'bg-amber-50 text-amber-600',
              },
              {
                icon: <Building2 className="w-6 h-6" />,
                title: 'Supplier Credit',
                desc: 'Track purchases and credit from suppliers. Know exactly what you owe and to whom.',
                color: 'bg-red-50 text-red-600',
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: 'Profit Analysis',
                desc: 'See your gross profit, net profit and margins. Understand where your money goes.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: <Lightbulb className="w-6 h-6" />,
                title: 'Business Insights',
                desc: 'Smart alerts derived from your actual data — top sellers, slow movers, outstanding debts.',
                color: 'bg-purple-50 text-purple-600',
              },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  {icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">How It Works</h2>
          <div className="space-y-8">
            {[
              { step: '1', title: 'Set up your products', desc: 'Add your inventory with purchase and selling prices. Takes 5 minutes.' },
              { step: '2', title: 'Record daily transactions', desc: 'Log sales, purchases and expenses as they happen. Forms are fast and simple.' },
              { step: '3', title: 'Track customer credit', desc: 'Add customers with outstanding balances. Record payments when they pay back.' },
              { step: '4', title: 'See the full picture', desc: 'Dashboard and analytics update automatically — see profit, stock and credit at a glance.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Bring Your Kirana Business Into the Digital Age.
          </h2>
          <p className="text-indigo-200 mb-8 text-base">
            No setup required. Open the dashboard, demo data is already loaded.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold text-base px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Open Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">CM</span>
          </div>
          <span className="text-white font-semibold text-sm">Co.Muneeb</span>
        </div>
        <p className="text-xs">"Your Kirana Business, Clearly."</p>
        <p className="text-xs mt-2">Built with React, Vite, Tailwind CSS & Recharts.</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <CheckCircle className="w-3 h-3 text-emerald-500" />
          <span className="text-xs text-emerald-400">Demo Mode — no account needed</span>
        </div>
      </footer>
    </div>
  )
}
