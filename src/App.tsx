import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'
import InventoryPage from '@/pages/InventoryPage'
import SalesPage from '@/pages/SalesPage'
import PurchasesPage from '@/pages/PurchasesPage'
import DebtorsPage from '@/pages/DebtorsPage'
import DebtorDetailPage from '@/pages/DebtorDetailPage'
import CreditorsPage from '@/pages/CreditorsPage'
import CreditorDetailPage from '@/pages/CreditorDetailPage'
import ExpensesPage from '@/pages/ExpensesPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import ReportsPage from '@/pages/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/purchases" element={<PurchasesPage />} />
          <Route path="/debtors" element={<DebtorsPage />} />
          <Route path="/debtors/:id" element={<DebtorDetailPage />} />
          <Route path="/creditors" element={<CreditorsPage />} />
          <Route path="/creditors/:id" element={<CreditorDetailPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
