// Payment and transaction type unions
export type PaymentMethod = 'cash' | 'upi' | 'credit'
export type TransactionType = 'debit' | 'credit'
export type PaymentStatus = 'paid' | 'credit' | 'partial'
export type MovementType = 'sale' | 'purchase' | 'adjustment'

// Store
export interface Store {
  id: string
  owner_id: string
  name: string
  address?: string
  phone?: string
  gstin?: string
  created_at: string
}

// Category
export interface Category {
  id: string
  store_id: string
  name: string
  color?: string
  icon?: string
}

// Product
export interface Product {
  id: string
  store_id: string
  category_id?: string
  category?: string
  name: string
  sku?: string
  brand?: string
  unit: string
  purchase_price: number
  selling_price: number
  current_stock: number
  min_stock_level: number
  supplier_id?: string
  supplier?: string
  expiry_date?: string
  created_at: string
  updated_at: string
}

// Customer (Debtor)
export interface Customer {
  id: string
  store_id: string
  name: string
  mobile?: string
  address?: string
  opening_balance: number
  current_balance: number
  due_date?: string
  notes?: string
  created_at: string
}

// Supplier (Creditor)
export interface Supplier {
  id: string
  store_id: string
  name: string
  contact_person?: string
  mobile?: string
  address?: string
  opening_balance: number
  current_balance: number
  due_date?: string
  notes?: string
  created_at: string
}

// Sale
export interface Sale {
  id: string
  store_id: string
  customer_id?: string
  customer_name?: string
  sale_date: string
  total_amount: number
  discount: number
  payment_method: PaymentMethod
  notes?: string
  created_at: string
}

// Sale Item
export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  product_name?: string
  quantity: number
  unit_price: number
  cost_price: number
  total_price: number
}

// Purchase
export interface Purchase {
  id: string
  store_id: string
  supplier_id?: string
  supplier_name?: string
  purchase_date: string
  total_amount: number
  payment_status: PaymentStatus
  notes?: string
  created_at: string
}

// Purchase Item
export interface PurchaseItem {
  id: string
  purchase_id: string
  product_id: string
  product_name?: string
  quantity: number
  unit_price: number
  total_price: number
}

// Customer Transaction
export interface CustomerTransaction {
  id: string
  store_id: string
  customer_id: string
  transaction_date: string
  description: string
  debit_amount: number
  credit_amount: number
  balance: number
  transaction_type: TransactionType
  reference_id?: string
}

// Supplier Transaction
export interface SupplierTransaction {
  id: string
  store_id: string
  supplier_id: string
  transaction_date: string
  description: string
  debit_amount: number
  credit_amount: number
  balance: number
  transaction_type: TransactionType
  reference_id?: string
}

// Expense
export interface Expense {
  id: string
  store_id: string
  expense_date: string
  category: string
  description?: string
  amount: number
  payment_method?: PaymentMethod
  created_at: string
}

// Inventory Movement
export interface InventoryMovement {
  id: string
  store_id: string
  product_id: string
  movement_date: string
  movement_type: MovementType
  quantity_change: number
  reference_id?: string
  notes?: string
}

// Dashboard Stats
export interface DashboardStats {
  // Financial
  todaySales: number
  todayPurchases: number
  todayExpenses: number
  todayProfit: number
  monthlySales: number
  monthlyProfit: number
  monthlyPurchases: number
  monthlyExpenses: number

  // Inventory
  totalProducts: number
  totalStockUnits: number
  totalInventoryValue: number
  lowStockItems: number
  outOfStockItems: number

  // Credit
  totalDebtorsReceivable: number
  totalCreditorsPayable: number
  overdueDebtorAmount: number
  overdueCreditorAmount: number

  // Top products
  topSellingProducts: Array<{
    product_id: string
    product_name: string
    total_qty: number
    total_revenue: number
  }>
  slowMovingProducts: Array<{
    product_id: string
    product_name: string
    current_stock: number
    last_sale_date: string | null
  }>

  // Trends (last 30 days daily)
  salesTrend: Array<{ date: string; amount: number }>
  expenseTrend: Array<{ date: string; amount: number }>
  profitTrend: Array<{ date: string; amount: number }>
}

// Insight Alert
export interface InsightAlert {
  id: string
  type: 'warning' | 'info' | 'success' | 'danger'
  title: string
  message: string
  action?: string
  actionLink?: string
}
