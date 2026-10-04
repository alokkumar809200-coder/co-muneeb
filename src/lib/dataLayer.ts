import type {
  Category,
  Product,
  Customer,
  Supplier,
  Sale,
  SaleItem,
  Purchase,
  PurchaseItem,
  CustomerTransaction,
  SupplierTransaction,
  Expense,
  DashboardStats,
} from '@/types'
import { generateId } from '@/lib/utils'
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase'
import {
  seedCategories,
  seedProducts,
  seedCustomers,
  seedSuppliers,
  seedSales,
  seedSaleItems,
  seedPurchases,
  seedPurchaseItems,
  seedCustomerTransactions,
  seedSupplierTransactions,
  seedExpenses,
} from '@/data/seedData'

// ─── IDataLayer interface ─────────────────────────────────────────────────────

export interface IDataLayer {
  // Categories
  getCategories(): Promise<Category[]>

  // Products
  getProducts(): Promise<Product[]>
  addProduct(p: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product>
  updateProduct(id: string, p: Partial<Product>): Promise<Product>
  deleteProduct(id: string): Promise<void>

  // Sales
  getSales(from?: string, to?: string): Promise<Sale[]>
  addSale(s: Omit<Sale, 'id' | 'created_at'>, items: Omit<SaleItem, 'id' | 'sale_id'>[]): Promise<Sale>
  getSaleItems(saleId: string): Promise<SaleItem[]>

  // Purchases
  getPurchases(from?: string, to?: string): Promise<Purchase[]>
  addPurchase(p: Omit<Purchase, 'id' | 'created_at'>, items: Omit<PurchaseItem, 'id' | 'purchase_id'>[]): Promise<Purchase>
  getPurchaseItems(purchaseId: string): Promise<PurchaseItem[]>

  // Customers
  getCustomers(): Promise<Customer[]>
  addCustomer(c: Omit<Customer, 'id' | 'created_at'>): Promise<Customer>
  updateCustomer(id: string, c: Partial<Customer>): Promise<Customer>
  getCustomerTransactions(customerId: string): Promise<CustomerTransaction[]>
  addCustomerTransaction(t: Omit<CustomerTransaction, 'id'>): Promise<CustomerTransaction>

  // Suppliers
  getSuppliers(): Promise<Supplier[]>
  addSupplier(s: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier>
  updateSupplier(id: string, s: Partial<Supplier>): Promise<Supplier>
  getSupplierTransactions(supplierId: string): Promise<SupplierTransaction[]>
  addSupplierTransaction(t: Omit<SupplierTransaction, 'id'>): Promise<SupplierTransaction>

  // Expenses
  getExpenses(from?: string, to?: string): Promise<Expense[]>
  addExpense(e: Omit<Expense, 'id' | 'created_at'>): Promise<Expense>

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>
}

// ─── LocalStorage keys ────────────────────────────────────────────────────────

const KEYS = {
  initialized: 'comunib_initialized',
  categories: 'comunib_categories',
  products: 'comunib_products',
  customers: 'comunib_customers',
  suppliers: 'comunib_suppliers',
  sales: 'comunib_sales',
  saleItems: 'comunib_sale_items',
  purchases: 'comunib_purchases',
  purchaseItems: 'comunib_purchase_items',
  customerTransactions: 'comunib_customer_transactions',
  supplierTransactions: 'comunib_supplier_transactions',
  expenses: 'comunib_expenses',
}

function lsGet<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function lsSet<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

// ─── LocalDataLayer ───────────────────────────────────────────────────────────

export class LocalDataLayer implements IDataLayer {
  constructor() {
    if (!localStorage.getItem(KEYS.initialized)) {
      this.initWithSeedData()
    }
  }

  private initWithSeedData(): void {
    lsSet(KEYS.categories, seedCategories)
    lsSet(KEYS.products, seedProducts)
    lsSet(KEYS.customers, seedCustomers)
    lsSet(KEYS.suppliers, seedSuppliers)
    lsSet(KEYS.sales, seedSales)
    lsSet(KEYS.saleItems, seedSaleItems)
    lsSet(KEYS.purchases, seedPurchases)
    lsSet(KEYS.purchaseItems, seedPurchaseItems)
    lsSet(KEYS.customerTransactions, seedCustomerTransactions)
    lsSet(KEYS.supplierTransactions, seedSupplierTransactions)
    lsSet(KEYS.expenses, seedExpenses)
    localStorage.setItem(KEYS.initialized, 'true')
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return lsGet<Category>(KEYS.categories)
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return lsGet<Product>(KEYS.products)
  }

  async addProduct(p: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const products = lsGet<Product>(KEYS.products)
    const now = new Date().toISOString()
    const newProduct: Product = { ...p, id: generateId(), created_at: now, updated_at: now }
    lsSet(KEYS.products, [...products, newProduct])
    return newProduct
  }

  async updateProduct(id: string, p: Partial<Product>): Promise<Product> {
    const products = lsGet<Product>(KEYS.products)
    const idx = products.findIndex(x => x.id === id)
    if (idx === -1) throw new Error(`Product ${id} not found`)
    const updated: Product = { ...products[idx], ...p, updated_at: new Date().toISOString() }
    products[idx] = updated
    lsSet(KEYS.products, products)
    return updated
  }

  async deleteProduct(id: string): Promise<void> {
    const products = lsGet<Product>(KEYS.products)
    lsSet(KEYS.products, products.filter(p => p.id !== id))
  }

  // Sales
  async getSales(from?: string, to?: string): Promise<Sale[]> {
    let sales = lsGet<Sale>(KEYS.sales)
    if (from) sales = sales.filter(s => s.sale_date >= from)
    if (to) sales = sales.filter(s => s.sale_date <= to)
    return sales.sort((a, b) => b.sale_date.localeCompare(a.sale_date))
  }

  async addSale(
    s: Omit<Sale, 'id' | 'created_at'>,
    items: Omit<SaleItem, 'id' | 'sale_id'>[]
  ): Promise<Sale> {
    const sales = lsGet<Sale>(KEYS.sales)
    const saleItems = lsGet<SaleItem>(KEYS.saleItems)
    const products = lsGet<Product>(KEYS.products)

    const now = new Date().toISOString()
    const saleId = generateId()
    const newSale: Sale = { ...s, id: saleId, created_at: now }

    const newItems: SaleItem[] = items.map(item => ({
      ...item,
      id: generateId(),
      sale_id: saleId,
    }))

    // Reduce stock
    for (const item of newItems) {
      const prodIdx = products.findIndex(p => p.id === item.product_id)
      if (prodIdx !== -1) {
        products[prodIdx] = {
          ...products[prodIdx],
          current_stock: Math.max(0, products[prodIdx].current_stock - item.quantity),
          updated_at: now,
        }
      }
    }

    // Update customer balance if credit sale
    if (s.payment_method === 'credit' && s.customer_id) {
      const customers = lsGet<Customer>(KEYS.customers)
      const custIdx = customers.findIndex(c => c.id === s.customer_id)
      if (custIdx !== -1) {
        customers[custIdx] = {
          ...customers[custIdx],
          current_balance: customers[custIdx].current_balance + s.total_amount,
        }
        lsSet(KEYS.customers, customers)
      }

      // Add customer transaction
      const custTransactions = lsGet<CustomerTransaction>(KEYS.customerTransactions)
      custTransactions.push({
        id: generateId(),
        store_id: s.store_id,
        customer_id: s.customer_id,
        transaction_date: s.sale_date,
        description: 'Credit sale',
        debit_amount: s.total_amount,
        credit_amount: 0,
        balance: s.total_amount,
        transaction_type: 'debit',
        reference_id: saleId,
      })
      lsSet(KEYS.customerTransactions, custTransactions)
    }

    lsSet(KEYS.sales, [...sales, newSale])
    lsSet(KEYS.saleItems, [...saleItems, ...newItems])
    lsSet(KEYS.products, products)

    return newSale
  }

  async getSaleItems(saleId: string): Promise<SaleItem[]> {
    return lsGet<SaleItem>(KEYS.saleItems).filter(i => i.sale_id === saleId)
  }

  // Purchases
  async getPurchases(from?: string, to?: string): Promise<Purchase[]> {
    let purchases = lsGet<Purchase>(KEYS.purchases)
    if (from) purchases = purchases.filter(p => p.purchase_date >= from)
    if (to) purchases = purchases.filter(p => p.purchase_date <= to)
    return purchases.sort((a, b) => b.purchase_date.localeCompare(a.purchase_date))
  }

  async addPurchase(
    p: Omit<Purchase, 'id' | 'created_at'>,
    items: Omit<PurchaseItem, 'id' | 'purchase_id'>[]
  ): Promise<Purchase> {
    const purchases = lsGet<Purchase>(KEYS.purchases)
    const purchaseItems = lsGet<PurchaseItem>(KEYS.purchaseItems)
    const products = lsGet<Product>(KEYS.products)

    const now = new Date().toISOString()
    const purchaseId = generateId()
    const newPurchase: Purchase = { ...p, id: purchaseId, created_at: now }

    const newItems: PurchaseItem[] = items.map(item => ({
      ...item,
      id: generateId(),
      purchase_id: purchaseId,
    }))

    // Increase stock
    for (const item of newItems) {
      const prodIdx = products.findIndex(prod => prod.id === item.product_id)
      if (prodIdx !== -1) {
        products[prodIdx] = {
          ...products[prodIdx],
          current_stock: products[prodIdx].current_stock + item.quantity,
          purchase_price: item.unit_price, // update to latest purchase price
          updated_at: now,
        }
      }
    }

    // Update supplier balance if credit purchase
    if ((p.payment_status === 'credit' || p.payment_status === 'partial') && p.supplier_id) {
      const suppliers = lsGet<Supplier>(KEYS.suppliers)
      const supIdx = suppliers.findIndex(s => s.id === p.supplier_id)
      const creditAmount = p.payment_status === 'partial' ? Math.round(p.total_amount * 0.5) : p.total_amount
      if (supIdx !== -1) {
        suppliers[supIdx] = {
          ...suppliers[supIdx],
          current_balance: suppliers[supIdx].current_balance + creditAmount,
        }
        lsSet(KEYS.suppliers, suppliers)
      }

      // Add supplier transaction
      const supTransactions = lsGet<SupplierTransaction>(KEYS.supplierTransactions)
      supTransactions.push({
        id: generateId(),
        store_id: p.store_id,
        supplier_id: p.supplier_id,
        transaction_date: p.purchase_date,
        description: 'Credit purchase',
        debit_amount: 0,
        credit_amount: creditAmount,
        balance: creditAmount,
        transaction_type: 'credit',
        reference_id: purchaseId,
      })
      lsSet(KEYS.supplierTransactions, supTransactions)
    }

    lsSet(KEYS.purchases, [...purchases, newPurchase])
    lsSet(KEYS.purchaseItems, [...purchaseItems, ...newItems])
    lsSet(KEYS.products, products)

    return newPurchase
  }

  async getPurchaseItems(purchaseId: string): Promise<PurchaseItem[]> {
    return lsGet<PurchaseItem>(KEYS.purchaseItems).filter(i => i.purchase_id === purchaseId)
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return lsGet<Customer>(KEYS.customers)
  }

  async addCustomer(c: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> {
    const customers = lsGet<Customer>(KEYS.customers)
    const newCustomer: Customer = { ...c, id: generateId(), created_at: new Date().toISOString() }
    lsSet(KEYS.customers, [...customers, newCustomer])
    return newCustomer
  }

  async updateCustomer(id: string, c: Partial<Customer>): Promise<Customer> {
    const customers = lsGet<Customer>(KEYS.customers)
    const idx = customers.findIndex(x => x.id === id)
    if (idx === -1) throw new Error(`Customer ${id} not found`)
    const updated: Customer = { ...customers[idx], ...c }
    customers[idx] = updated
    lsSet(KEYS.customers, customers)
    return updated
  }

  async getCustomerTransactions(customerId: string): Promise<CustomerTransaction[]> {
    return lsGet<CustomerTransaction>(KEYS.customerTransactions)
      .filter(t => t.customer_id === customerId)
      .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
  }

  async addCustomerTransaction(t: Omit<CustomerTransaction, 'id'>): Promise<CustomerTransaction> {
    const transactions = lsGet<CustomerTransaction>(KEYS.customerTransactions)
    const newTx: CustomerTransaction = { ...t, id: generateId() }
    lsSet(KEYS.customerTransactions, [...transactions, newTx])

    // Update customer balance
    const customers = lsGet<Customer>(KEYS.customers)
    const idx = customers.findIndex(c => c.id === t.customer_id)
    if (idx !== -1) {
      const delta = t.debit_amount - t.credit_amount
      customers[idx] = {
        ...customers[idx],
        current_balance: customers[idx].current_balance + delta,
      }
      lsSet(KEYS.customers, customers)
    }

    return newTx
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return lsGet<Supplier>(KEYS.suppliers)
  }

  async addSupplier(s: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier> {
    const suppliers = lsGet<Supplier>(KEYS.suppliers)
    const newSupplier: Supplier = { ...s, id: generateId(), created_at: new Date().toISOString() }
    lsSet(KEYS.suppliers, [...suppliers, newSupplier])
    return newSupplier
  }

  async updateSupplier(id: string, s: Partial<Supplier>): Promise<Supplier> {
    const suppliers = lsGet<Supplier>(KEYS.suppliers)
    const idx = suppliers.findIndex(x => x.id === id)
    if (idx === -1) throw new Error(`Supplier ${id} not found`)
    const updated: Supplier = { ...suppliers[idx], ...s }
    suppliers[idx] = updated
    lsSet(KEYS.suppliers, suppliers)
    return updated
  }

  async getSupplierTransactions(supplierId: string): Promise<SupplierTransaction[]> {
    return lsGet<SupplierTransaction>(KEYS.supplierTransactions)
      .filter(t => t.supplier_id === supplierId)
      .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
  }

  async addSupplierTransaction(t: Omit<SupplierTransaction, 'id'>): Promise<SupplierTransaction> {
    const transactions = lsGet<SupplierTransaction>(KEYS.supplierTransactions)
    const newTx: SupplierTransaction = { ...t, id: generateId() }
    lsSet(KEYS.supplierTransactions, [...transactions, newTx])

    // Update supplier balance
    const suppliers = lsGet<Supplier>(KEYS.suppliers)
    const idx = suppliers.findIndex(s => s.id === t.supplier_id)
    if (idx !== -1) {
      const delta = t.credit_amount - t.debit_amount
      suppliers[idx] = {
        ...suppliers[idx],
        current_balance: suppliers[idx].current_balance + delta,
      }
      lsSet(KEYS.suppliers, suppliers)
    }

    return newTx
  }

  // Expenses
  async getExpenses(from?: string, to?: string): Promise<Expense[]> {
    let expenses = lsGet<Expense>(KEYS.expenses)
    if (from) expenses = expenses.filter(e => e.expense_date >= from)
    if (to) expenses = expenses.filter(e => e.expense_date <= to)
    return expenses.sort((a, b) => b.expense_date.localeCompare(a.expense_date))
  }

  async addExpense(e: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    const expenses = lsGet<Expense>(KEYS.expenses)
    const now = new Date().toISOString()
    const newExpense: Expense = { ...e, id: generateId(), created_at: now }
    lsSet(KEYS.expenses, [...expenses, newExpense])
    return newExpense
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0]
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const monthStart = today.substring(0, 8) + '01'

    const [products, customers, suppliers, allSales, allSaleItems, allPurchases, allExpenses] = await Promise.all([
      this.getProducts(),
      this.getCustomers(),
      this.getSuppliers(),
      this.getSales(),
      Promise.resolve(lsGet<SaleItem>(KEYS.saleItems)),
      this.getPurchases(),
      this.getExpenses(),
    ])

    // Today's data
    const todaySalesArr = allSales.filter(s => s.sale_date === today)
    const todayPurchasesArr = allPurchases.filter(p => p.purchase_date === today)
    const todayExpensesArr = allExpenses.filter(e => e.expense_date === today)

    const todaySales = todaySalesArr.reduce((sum, s) => sum + s.total_amount, 0)
    const todayPurchases = todayPurchasesArr.reduce((sum, p) => sum + p.total_amount, 0)
    const todayExpenses = todayExpensesArr.reduce((sum, e) => sum + e.amount, 0)

    // Calculate COGS for today's sales
    const todaySaleIds = new Set(todaySalesArr.map(s => s.id))
    const todaySaleItemsArr = allSaleItems.filter(i => todaySaleIds.has(i.sale_id))
    const todayCOGS = todaySaleItemsArr.reduce((sum, i) => sum + i.cost_price * i.quantity, 0)
    const todayProfit = todaySales - todayCOGS - todayExpenses

    // Monthly data
    const monthlySalesArr = allSales.filter(s => s.sale_date >= monthStart)
    const monthlyPurchasesArr = allPurchases.filter(p => p.purchase_date >= monthStart)
    const monthlyExpensesArr = allExpenses.filter(e => e.expense_date >= monthStart)

    const monthlySales = monthlySalesArr.reduce((sum, s) => sum + s.total_amount, 0)
    const monthlyPurchases = monthlyPurchasesArr.reduce((sum, p) => sum + p.total_amount, 0)
    const monthlyExpenses = monthlyExpensesArr.reduce((sum, e) => sum + e.amount, 0)

    const monthlySaleIds = new Set(monthlySalesArr.map(s => s.id))
    const monthlySaleItems = allSaleItems.filter(i => monthlySaleIds.has(i.sale_id))
    const monthlyCOGS = monthlySaleItems.reduce((sum, i) => sum + i.cost_price * i.quantity, 0)
    const monthlyProfit = monthlySales - monthlyCOGS - monthlyExpenses

    // Inventory stats
    const totalProducts = products.length
    const totalStockUnits = products.reduce((sum, p) => sum + p.current_stock, 0)
    const totalInventoryValue = products.reduce((sum, p) => sum + p.current_stock * p.purchase_price, 0)
    const lowStockItems = products.filter(p => p.current_stock > 0 && p.current_stock <= p.min_stock_level).length
    const outOfStockItems = products.filter(p => p.current_stock === 0).length

    // Credit stats
    const totalDebtorsReceivable = customers.reduce((sum, c) => sum + Math.max(0, c.current_balance), 0)
    const totalCreditorsPayable = suppliers.reduce((sum, s) => sum + Math.max(0, s.current_balance), 0)
    const overdueDebtorAmount = customers
      .filter(c => c.due_date && c.due_date < today && c.current_balance > 0)
      .reduce((sum, c) => sum + c.current_balance, 0)
    const overdueCreditorAmount = suppliers
      .filter(s => s.due_date && s.due_date < today && s.current_balance > 0)
      .reduce((sum, s) => sum + s.current_balance, 0)

    // Top selling products (last 30 days)
    const recentSales = allSales.filter(s => s.sale_date >= thirtyDaysAgo)
    const recentSaleIds = new Set(recentSales.map(s => s.id))
    const recentItems = allSaleItems.filter(i => recentSaleIds.has(i.sale_id))

    const productSalesMap = new Map<string, { qty: number; revenue: number; name: string }>()
    for (const item of recentItems) {
      const existing = productSalesMap.get(item.product_id) ?? { qty: 0, revenue: 0, name: item.product_name ?? '' }
      productSalesMap.set(item.product_id, {
        qty: existing.qty + item.quantity,
        revenue: existing.revenue + item.total_price,
        name: item.product_name ?? products.find(p => p.id === item.product_id)?.name ?? item.product_id,
      })
    }

    const topSellingProducts = Array.from(productSalesMap.entries())
      .map(([id, data]) => ({
        product_id: id,
        product_name: data.name,
        total_qty: data.qty,
        total_revenue: data.revenue,
      }))
      .sort((a, b) => b.total_qty - a.total_qty)
      .slice(0, 5)

    // Slow-moving products (not in recent sales or low qty)
    const recentProductIds = new Set(recentItems.map(i => i.product_id))
    const slowMovingProducts = products
      .filter(p => !recentProductIds.has(p.id) && p.current_stock > 0)
      .map(p => ({
        product_id: p.id,
        product_name: p.name,
        current_stock: p.current_stock,
        last_sale_date: null as string | null,
      }))
      .slice(0, 5)

    // Daily trends (last 30 days)
    const salesByDate = new Map<string, number>()
    const expensesByDate = new Map<string, number>()
    const profitByDate = new Map<string, number>()

    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      salesByDate.set(d, 0)
      expensesByDate.set(d, 0)
      profitByDate.set(d, 0)
    }

    for (const sale of allSales.filter(s => s.sale_date >= thirtyDaysAgo)) {
      salesByDate.set(sale.sale_date, (salesByDate.get(sale.sale_date) ?? 0) + sale.total_amount)
    }

    for (const exp of allExpenses.filter(e => e.expense_date >= thirtyDaysAgo)) {
      expensesByDate.set(exp.expense_date, (expensesByDate.get(exp.expense_date) ?? 0) + exp.amount)
    }

    // Compute profit per day
    const saleItemsBySaleId = new Map<string, SaleItem[]>()
    for (const item of allSaleItems) {
      const arr = saleItemsBySaleId.get(item.sale_id) ?? []
      arr.push(item)
      saleItemsBySaleId.set(item.sale_id, arr)
    }

    for (const sale of allSales.filter(s => s.sale_date >= thirtyDaysAgo)) {
      const items = saleItemsBySaleId.get(sale.id) ?? []
      const cogs = items.reduce((sum, i) => sum + i.cost_price * i.quantity, 0)
      const gross = sale.total_amount - cogs
      profitByDate.set(sale.sale_date, (profitByDate.get(sale.sale_date) ?? 0) + gross)
    }

    for (const exp of allExpenses.filter(e => e.expense_date >= thirtyDaysAgo)) {
      profitByDate.set(exp.expense_date, (profitByDate.get(exp.expense_date) ?? 0) - exp.amount)
    }

    const salesTrend = Array.from(salesByDate.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const expenseTrend = Array.from(expensesByDate.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const profitTrend = Array.from(profitByDate.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      todaySales,
      todayPurchases,
      todayExpenses,
      todayProfit,
      monthlySales,
      monthlyProfit,
      monthlyPurchases,
      monthlyExpenses,
      totalProducts,
      totalStockUnits,
      totalInventoryValue,
      lowStockItems,
      outOfStockItems,
      totalDebtorsReceivable,
      totalCreditorsPayable,
      overdueDebtorAmount,
      overdueCreditorAmount,
      topSellingProducts,
      slowMovingProducts,
      salesTrend,
      expenseTrend,
      profitTrend,
    }
  }
}

// ─── SupabaseDataLayer ────────────────────────────────────────────────────────

export class SupabaseDataLayer implements IDataLayer {
  private storeId: string | null = null

  private async getStoreId(): Promise<string> {
    if (this.storeId) return this.storeId
    const client = getSupabaseClient()!
    const { data } = await client.rpc('get_user_store_id')
    this.storeId = data as string
    return this.storeId
  }

  async getCategories(): Promise<Category[]> {
    const client = getSupabaseClient()!
    const storeId = await this.getStoreId()
    const { data, error } = await client
      .from('categories')
      .select('*')
      .eq('store_id', storeId)
    if (error) throw error
    return data as Category[]
  }

  async getProducts(): Promise<Product[]> {
    const client = getSupabaseClient()!
    const storeId = await this.getStoreId()
    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('store_id', storeId)
    if (error) throw error
    return data as Product[]
  }

  async addProduct(p: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const client = getSupabaseClient()!
    const { data, error } = await client.from('products').insert(p).select().single()
    if (error) throw error
    return data as Product
  }

  async updateProduct(id: string, p: Partial<Product>): Promise<Product> {
    const client = getSupabaseClient()!
    const { data, error } = await client.from('products').update(p).eq('id', id).select().single()
    if (error) throw error
    return data as Product
  }

  async deleteProduct(id: string): Promise<void> {
    const client = getSupabaseClient()!
    const { error } = await client.from('products').delete().eq('id', id)
    if (error) throw error
  }

  async getSales(from?: string, to?: string): Promise<Sale[]> {
    const client = getSupabaseClient()!
    const storeId = await this.getStoreId()
    let query = client.from('sales').select('*').eq('store_id', storeId)
    if (from) query = query.gte('sale_date', from)
    if (to) query = query.lte('sale_date', to)
    const { data, error } = await query.order('sale_date', { ascending: false })
    if (error) throw error
    return data as Sale[]
  }

  async addSale(
    s: Omit<Sale, 'id' | 'created_at'>,
    items: Omit<SaleItem, 'id' | 'sale_id'>[]
  ): Promise<Sale> {
    const client = getSupabaseClient()!
    const { data, error } = await client.from('sales').insert(s).select().single()
    if (error) throw error
    const sale = data as Sale
    const saleItems = items.map(item => ({ ...item, sale_id: sale.id }))
    const { error: itemsError } = await client.from('sale_items').insert(saleItems)
    if (itemsError) throw itemsError
    return sale
  }

  async getSaleItems(saleId: string): Promise<SaleItem[]> {
    const client = getSupabaseClient()!
    const { data, error } = await client.from('sale_items').select('*').eq('sale_id', saleId)
    if (error) throw error
    return data as SaleItem[]
  }

  async getPurchases(from?: string, to?: string): Promise<Purchase[]> {
    const client = getSupabaseClient()!
    const storeId = await this.getStoreId()
    let query = client.from('purchases').select('*').eq('store_id', storeId)
    if (from) query = query.gte('purchase_date', from)
    if (to) query = query.lte('purchase_date', to)
    const { data, error } = await query.order('purchase_date', { ascending: false })
    if (error) throw error
    return data as Purchase[]
  }

  async addPurchase(
    p: Omit<Purchase, 'id' | 'created_at'>,
    items: Omit<PurchaseItem, 'id' | 'purchase_id'>[]
  ): Promise<Purchase> {
    const client = getSupabaseClient()!
    const { data, error } = await client.from('purchases').insert(p).select().single()
    if (error) throw error
    const purchase = data as Purchase
    const purchaseItems = items.map(item => ({ ...item, purchase_id: purchase.id }))
    const { error: itemsError } = await client.from('purchase_items').insert(purchaseItems)
    if (itemsError) throw itemsError
    return purchase
  }

  async getPurchaseItems(purchaseId: string): Promise<PurchaseItem[]> {
    const client = getSupabaseClient()!
    const { data, error } = await client.from('purchase_items').select('*').eq('purchase_id', purchaseId)
    if (error) throw error
    return data as PurchaseItem[]
  }

  async getCustomers(): Promise<Customer[]> {
    const client = getSupabaseClient()!
    const storeId = await this.getStoreId()
    const { data, error } = await client.from('customers').select('*').eq('store_id', storeId)
    if (error) throw error
    return data as Customer[]
  }

  async addCustomer(c: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> {
    const client = getSupabaseClient()!
    const { data, error } = await client.from('customers').insert(c).select().single()
    if (error) throw error
    return data as Customer
  }

  async updateCustomer(id: string, c: Partial<Customer>): Promise<Customer> {
    const client = getSupabaseClient()!
    const { data, error } = await client.from('customers').update(c).eq('id', id).select().single()
    if (error) throw error
    return data as Customer
  }

  async getCustomerTransactions(customerId: string): Promise<CustomerTransaction[]> {
    const client = getSupabaseClient()!
    const { data, error } = await client
      .from('customer_transactions')
      .select('*')
      .eq('customer_id', customerId)
      .order('transaction_date', { ascending: false })
    if (error) throw error
    return data as CustomerTransaction[]
  }

  async addCustomerTransaction(t: Omit<CustomerTransaction, 'id'>): Promise<CustomerTransaction> {
    const client = getSupabaseClient()!
    const { data, error } = await client.from('customer_transactions').insert(t).select().single()
    if (error) throw error
    return data as CustomerTransaction
  }

  async getSuppliers(): Promise<Supplier[]> {
    const client = getSupabaseClient()!
    const storeId = await this.getStoreId()
    const { data, error } = await client.from('suppliers').select('*').eq('store_id', storeId)
    if (error) throw error
    return data as Supplier[]
  }

  async addSupplier(s: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier> {
    const client = getSupabaseClient()!
    const { data, error } = await client.from('suppliers').insert(s).select().single()
    if (error) throw error
    return data as Supplier
  }

  async updateSupplier(id: string, s: Partial<Supplier>): Promise<Supplier> {
    const client = getSupabaseClient()!
    const { data, error } = await client.from('suppliers').update(s).eq('id', id).select().single()
    if (error) throw error
    return data as Supplier
  }

  async getSupplierTransactions(supplierId: string): Promise<SupplierTransaction[]> {
    const client = getSupabaseClient()!
    const { data, error } = await client
      .from('supplier_transactions')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('transaction_date', { ascending: false })
    if (error) throw error
    return data as SupplierTransaction[]
  }

  async addSupplierTransaction(t: Omit<SupplierTransaction, 'id'>): Promise<SupplierTransaction> {
    const client = getSupabaseClient()!
    const { data, error } = await client.from('supplier_transactions').insert(t).select().single()
    if (error) throw error
    return data as SupplierTransaction
  }

  async getExpenses(from?: string, to?: string): Promise<Expense[]> {
    const client = getSupabaseClient()!
    const storeId = await this.getStoreId()
    let query = client.from('expenses').select('*').eq('store_id', storeId)
    if (from) query = query.gte('expense_date', from)
    if (to) query = query.lte('expense_date', to)
    const { data, error } = await query.order('expense_date', { ascending: false })
    if (error) throw error
    return data as Expense[]
  }

  async addExpense(e: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    const client = getSupabaseClient()!
    const { data, error } = await client.from('expenses').insert(e).select().single()
    if (error) throw error
    return data as Expense
  }

  async getDashboardStats(): Promise<DashboardStats> {
    // Delegate to LocalDataLayer pattern for now — compute from raw data
    // In production this would use a Supabase RPC function
    const local = new LocalDataLayer()
    return local.getDashboardStats()
  }
}

// ─── Singleton factory ────────────────────────────────────────────────────────

let _dataLayer: IDataLayer | null = null

export function getDataLayer(): IDataLayer {
  if (!_dataLayer) {
    if (isSupabaseConfigured()) {
      _dataLayer = new SupabaseDataLayer()
    } else {
      _dataLayer = new LocalDataLayer()
    }
  }
  return _dataLayer
}
