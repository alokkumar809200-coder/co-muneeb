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
} from '@/types'

// ─── Deterministic seeded random (LCG) ────────────────────────────────────────
// Using a seeded PRNG so the data is reproducible across refreshes.
function createSeededRandom(seed: number) {
  let s = seed
  return function (): number {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}
const rand = createSeededRandom(42)

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

// ─── IDs ──────────────────────────────────────────────────────────────────────
const STORE_ID = 'seed-store-001'

// ─── Categories ───────────────────────────────────────────────────────────────
export const seedCategories: Category[] = [
  { id: 'cat-grains', store_id: STORE_ID, name: 'Grains', color: '#f59e0b', icon: 'wheat' },
  { id: 'cat-essentials', store_id: STORE_ID, name: 'Essentials', color: '#6366f1', icon: 'package' },
  { id: 'cat-oils', store_id: STORE_ID, name: 'Oils', color: '#f97316', icon: 'droplets' },
  { id: 'cat-snacks', store_id: STORE_ID, name: 'Snacks', color: '#ec4899', icon: 'cookie' },
  { id: 'cat-personal', store_id: STORE_ID, name: 'Personal Care', color: '#8b5cf6', icon: 'heart' },
  { id: 'cat-beverages', store_id: STORE_ID, name: 'Beverages', color: '#10b981', icon: 'coffee' },
]

// ─── Suppliers ────────────────────────────────────────────────────────────────
export const seedSuppliers: Supplier[] = [
  {
    id: 'sup-001',
    store_id: STORE_ID,
    name: 'Agarwal Traders',
    contact_person: 'Vijay Agarwal',
    mobile: '9876541001',
    address: 'Shop 12, Grain Market, Delhi',
    opening_balance: 0,
    current_balance: 5200,
    created_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'sup-002',
    store_id: STORE_ID,
    name: 'Sharma Wholesale',
    contact_person: 'Rakesh Sharma',
    mobile: '9876541002',
    address: '45 Wholesale Hub, Noida',
    opening_balance: 0,
    current_balance: 3100,
    created_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'sup-003',
    store_id: STORE_ID,
    name: 'Kumar Distributors',
    contact_person: 'Suresh Kumar',
    mobile: '9876541003',
    address: 'B-7 Industrial Area, Gurgaon',
    opening_balance: 0,
    current_balance: 4800,
    created_at: '2024-07-01T00:00:00.000Z',
  },
]

// ─── Products ─────────────────────────────────────────────────────────────────
export const seedProducts: Product[] = [
  {
    id: 'prod-001',
    store_id: STORE_ID,
    category_id: 'cat-grains',
    category: 'Grains',
    name: 'Rice',
    sku: 'RICE001',
    brand: 'India Gate',
    unit: 'kg',
    purchase_price: 45,
    selling_price: 55,
    current_stock: 150,
    min_stock_level: 50,
    supplier_id: 'sup-001',
    supplier: 'Agarwal Traders',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'prod-002',
    store_id: STORE_ID,
    category_id: 'cat-grains',
    category: 'Grains',
    name: 'Wheat',
    sku: 'WHT001',
    brand: 'Shaktibhog',
    unit: 'kg',
    purchase_price: 28,
    selling_price: 35,
    current_stock: 200,
    min_stock_level: 50,
    supplier_id: 'sup-001',
    supplier: 'Agarwal Traders',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'prod-003',
    store_id: STORE_ID,
    category_id: 'cat-essentials',
    category: 'Essentials',
    name: 'Sugar',
    sku: 'SUG001',
    brand: 'Uttam',
    unit: 'kg',
    purchase_price: 38,
    selling_price: 45,
    current_stock: 100,
    min_stock_level: 30,
    supplier_id: 'sup-002',
    supplier: 'Sharma Wholesale',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'prod-004',
    store_id: STORE_ID,
    category_id: 'cat-oils',
    category: 'Oils',
    name: 'Mustard Oil',
    sku: 'OIL001',
    brand: 'Patanjali',
    unit: 'ltr',
    purchase_price: 120,
    selling_price: 145,
    current_stock: 60,
    min_stock_level: 20,
    supplier_id: 'sup-002',
    supplier: 'Sharma Wholesale',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'prod-005',
    store_id: STORE_ID,
    category_id: 'cat-snacks',
    category: 'Snacks',
    name: 'Parle-G Biscuits',
    sku: 'BISK001',
    brand: 'Parle',
    unit: 'pkt',
    purchase_price: 8,
    selling_price: 10,
    current_stock: 300,
    min_stock_level: 100,
    supplier_id: 'sup-003',
    supplier: 'Kumar Distributors',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'prod-006',
    store_id: STORE_ID,
    category_id: 'cat-snacks',
    category: 'Snacks',
    name: 'Maggi Noodles',
    sku: 'MAG001',
    brand: 'Nestle',
    unit: 'pkt',
    purchase_price: 12,
    selling_price: 15,
    current_stock: 200,
    min_stock_level: 80,
    supplier_id: 'sup-003',
    supplier: 'Kumar Distributors',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'prod-007',
    store_id: STORE_ID,
    category_id: 'cat-personal',
    category: 'Personal Care',
    name: 'Lux Soap',
    sku: 'SOAP001',
    brand: 'HUL',
    unit: 'bar',
    purchase_price: 35,
    selling_price: 42,
    current_stock: 120,
    min_stock_level: 40,
    supplier_id: 'sup-003',
    supplier: 'Kumar Distributors',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'prod-008',
    store_id: STORE_ID,
    category_id: 'cat-personal',
    category: 'Personal Care',
    name: 'Clinic Plus Shampoo',
    sku: 'SHMP001',
    brand: 'HUL',
    unit: 'btl',
    purchase_price: 65,
    selling_price: 80,
    current_stock: 80,
    min_stock_level: 25,
    supplier_id: 'sup-003',
    supplier: 'Kumar Distributors',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'prod-009',
    store_id: STORE_ID,
    category_id: 'cat-beverages',
    category: 'Beverages',
    name: 'Tata Tea',
    sku: 'TEA001',
    brand: 'Tata',
    unit: 'pkt',
    purchase_price: 95,
    selling_price: 115,
    current_stock: 90,
    min_stock_level: 30,
    supplier_id: 'sup-001',
    supplier: 'Agarwal Traders',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'prod-010',
    store_id: STORE_ID,
    category_id: 'cat-essentials',
    category: 'Essentials',
    name: 'Salt',
    sku: 'SALT001',
    brand: 'Tata',
    unit: 'kg',
    purchase_price: 15,
    selling_price: 20,
    current_stock: 200,
    min_stock_level: 60,
    supplier_id: 'sup-002',
    supplier: 'Sharma Wholesale',
    created_at: '2024-07-01T00:00:00.000Z',
    updated_at: '2024-07-01T00:00:00.000Z',
  },
]

// ─── Customers ────────────────────────────────────────────────────────────────
export const seedCustomers: Customer[] = [
  {
    id: 'cust-001',
    store_id: STORE_ID,
    name: 'Ramesh Kumar',
    mobile: '9876543210',
    address: '12 MG Road, Delhi',
    opening_balance: 0,
    current_balance: 850,
    created_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'cust-002',
    store_id: STORE_ID,
    name: 'Priya Sharma',
    mobile: '9876543211',
    address: '45 Lajpat Nagar, Delhi',
    opening_balance: 0,
    current_balance: 1200,
    created_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'cust-003',
    store_id: STORE_ID,
    name: 'Abdul Rehman',
    mobile: '9876543212',
    address: '8 Karol Bagh, Delhi',
    opening_balance: 0,
    current_balance: 600,
    created_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'cust-004',
    store_id: STORE_ID,
    name: 'Sunita Devi',
    mobile: '9876543213',
    address: '22 Saket, Delhi',
    opening_balance: 0,
    current_balance: 450,
    created_at: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'cust-005',
    store_id: STORE_ID,
    name: 'Mohan Singh',
    mobile: '9876543214',
    address: '7 Rohini, Delhi',
    opening_balance: 0,
    current_balance: 0,
    created_at: '2024-07-01T00:00:00.000Z',
  },
]

// ─── Generate 90 days of sales data ──────────────────────────────────────────
// Base date: 90 days ago from a fixed reference point
const BASE_DATE = new Date('2024-07-01T00:00:00.000Z')

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Product weights for realistic sales (higher index = more frequently sold)
const PRODUCT_WEIGHTS = [
  { id: 'prod-001', weight: 10 }, // Rice - very fast
  { id: 'prod-002', weight: 8 },  // Wheat - fast
  { id: 'prod-003', weight: 9 },  // Sugar - very fast
  { id: 'prod-004', weight: 6 },  // Mustard Oil - medium
  { id: 'prod-005', weight: 12 }, // Parle-G - fastest
  { id: 'prod-006', weight: 11 }, // Maggi - very fast
  { id: 'prod-007', weight: 7 },  // Lux Soap - medium
  { id: 'prod-008', weight: 5 },  // Shampoo - medium-slow
  { id: 'prod-009', weight: 9 },  // Tata Tea - fast
  { id: 'prod-010', weight: 8 },  // Salt - fast
]

function weightedProductPick(): string {
  const totalWeight = PRODUCT_WEIGHTS.reduce((s, p) => s + p.weight, 0)
  let r = rand() * totalWeight
  for (const p of PRODUCT_WEIGHTS) {
    r -= p.weight
    if (r <= 0) return p.id
  }
  return PRODUCT_WEIGHTS[0].id
}

const PAYMENT_METHODS: Array<'cash' | 'upi' | 'credit'> = ['cash', 'cash', 'cash', 'upi', 'upi', 'credit']
const CUSTOMER_IDS = seedCustomers.map(c => c.id)

// Generate sales
export const seedSales: Sale[] = []
export const seedSaleItems: SaleItem[] = []

for (let day = 0; day < 90; day++) {
  const saleDate = addDays(BASE_DATE, day)
  const saleDateStr = toISO(saleDate)
  const numSales = randInt(3, 8)

  for (let s = 0; s < numSales; s++) {
    const saleId = `sale-${day}-${s}`
    const paymentMethod = pickRandom(PAYMENT_METHODS)
    const customerId = paymentMethod === 'credit' ? pickRandom(CUSTOMER_IDS) : undefined
    const customerName = customerId
      ? seedCustomers.find(c => c.id === customerId)?.name
      : undefined

    // 1-3 items per sale
    const numItems = randInt(1, 3)
    let totalAmount = 0
    const items: SaleItem[] = []

    for (let i = 0; i < numItems; i++) {
      const productId = weightedProductPick()
      const product = seedProducts.find(p => p.id === productId)!
      const qty = randInt(1, 5)
      const unitPrice = product.selling_price
      const costPrice = product.purchase_price
      const totalPrice = qty * unitPrice
      totalAmount += totalPrice

      items.push({
        id: `si-${day}-${s}-${i}`,
        sale_id: saleId,
        product_id: productId,
        product_name: product.name,
        quantity: qty,
        unit_price: unitPrice,
        cost_price: costPrice,
        total_price: totalPrice,
      })
    }

    seedSales.push({
      id: saleId,
      store_id: STORE_ID,
      customer_id: customerId,
      customer_name: customerName,
      sale_date: saleDateStr,
      total_amount: totalAmount,
      discount: 0,
      payment_method: paymentMethod,
      created_at: saleDate.toISOString(),
    })

    seedSaleItems.push(...items)
  }
}

// ─── Generate 90 days of purchase data (2-4 per week) ────────────────────────
export const seedPurchases: Purchase[] = []
export const seedPurchaseItems: PurchaseItem[] = []

const SUPPLIER_IDS = seedSuppliers.map(s => s.id)

// Map products to their supplier
const PRODUCT_SUPPLIER: Record<string, string> = {}
for (const p of seedProducts) {
  if (p.supplier_id) PRODUCT_SUPPLIER[p.id] = p.supplier_id
}

let purchaseCount = 0
for (let week = 0; week < 13; week++) {
  const numPurchases = randInt(2, 4)
  for (let p = 0; p < numPurchases; p++) {
    const dayOffset = week * 7 + randInt(0, 6)
    if (dayOffset >= 90) continue
    const purchaseDate = addDays(BASE_DATE, dayOffset)
    const purchaseDateStr = toISO(purchaseDate)
    const supplierId = pickRandom(SUPPLIER_IDS)
    const supplier = seedSuppliers.find(s => s.id === supplierId)!
    const paymentStatus = pickRandom<'paid' | 'credit' | 'partial'>(['paid', 'paid', 'credit', 'partial'])

    // 2-4 items per purchase
    const numItems = randInt(2, 4)
    let totalAmount = 0
    const items: PurchaseItem[] = []

    // Pick products that belong to this supplier preferably
    const supplierProducts = seedProducts.filter(pr => pr.supplier_id === supplierId)
    const pool = supplierProducts.length >= 2 ? supplierProducts : seedProducts

    for (let i = 0; i < numItems; i++) {
      const product = pickRandom(pool)
      const qty = randInt(10, 50)
      const unitPrice = product.purchase_price
      const totalPrice = qty * unitPrice
      totalAmount += totalPrice

      items.push({
        id: `pi-${purchaseCount}-${i}`,
        purchase_id: `pur-${purchaseCount}`,
        product_id: product.id,
        product_name: product.name,
        quantity: qty,
        unit_price: unitPrice,
        total_price: totalPrice,
      })
    }

    seedPurchases.push({
      id: `pur-${purchaseCount}`,
      store_id: STORE_ID,
      supplier_id: supplierId,
      supplier_name: supplier.name,
      purchase_date: purchaseDateStr,
      total_amount: totalAmount,
      payment_status: paymentStatus,
      created_at: purchaseDate.toISOString(),
    })

    seedPurchaseItems.push(...items)
    purchaseCount++
  }
}

// ─── Customer Transactions ────────────────────────────────────────────────────
export const seedCustomerTransactions: CustomerTransaction[] = []

// Generate credit sales transactions + some payments for each customer
const creditSales = seedSales.filter(s => s.payment_method === 'credit')

for (const sale of creditSales) {
  if (!sale.customer_id) continue
  seedCustomerTransactions.push({
    id: `ct-sale-${sale.id}`,
    store_id: STORE_ID,
    customer_id: sale.customer_id,
    transaction_date: sale.sale_date,
    description: `Purchase on credit`,
    debit_amount: sale.total_amount,
    credit_amount: 0,
    balance: sale.total_amount,
    transaction_type: 'debit',
    reference_id: sale.id,
  })
}

// Add some payments per customer
for (const customer of seedCustomers) {
  const customerSales = creditSales.filter(s => s.customer_id === customer.id)
  if (customerSales.length === 0) continue

  // Add 1-3 payments per customer
  const numPayments = randInt(1, 3)
  for (let i = 0; i < numPayments; i++) {
    const payDate = addDays(BASE_DATE, randInt(5, 85))
    const amount = randInt(200, 800)
    seedCustomerTransactions.push({
      id: `ct-pay-${customer.id}-${i}`,
      store_id: STORE_ID,
      customer_id: customer.id,
      transaction_date: toISO(payDate),
      description: 'Payment received',
      debit_amount: 0,
      credit_amount: amount,
      balance: -amount,
      transaction_type: 'credit',
    })
  }
}

// ─── Supplier Transactions ────────────────────────────────────────────────────
export const seedSupplierTransactions: SupplierTransaction[] = []

const creditPurchases = seedPurchases.filter(p => p.payment_status === 'credit' || p.payment_status === 'partial')

for (const purchase of creditPurchases) {
  if (!purchase.supplier_id) continue
  const creditAmount = purchase.payment_status === 'partial'
    ? Math.round(purchase.total_amount * 0.5)
    : purchase.total_amount

  seedSupplierTransactions.push({
    id: `st-pur-${purchase.id}`,
    store_id: STORE_ID,
    supplier_id: purchase.supplier_id,
    transaction_date: purchase.purchase_date,
    description: 'Goods purchased on credit',
    debit_amount: 0,
    credit_amount: creditAmount,
    balance: creditAmount,
    transaction_type: 'credit',
    reference_id: purchase.id,
  })
}

// Add some payments to suppliers
for (const supplier of seedSuppliers) {
  const numPayments = randInt(1, 3)
  for (let i = 0; i < numPayments; i++) {
    const payDate = addDays(BASE_DATE, randInt(10, 80))
    const amount = randInt(500, 2000)
    seedSupplierTransactions.push({
      id: `st-pay-${supplier.id}-${i}`,
      store_id: STORE_ID,
      supplier_id: supplier.id,
      transaction_date: toISO(payDate),
      description: 'Payment made to supplier',
      debit_amount: amount,
      credit_amount: 0,
      balance: -amount,
      transaction_type: 'debit',
    })
  }
}

// ─── Expenses ─────────────────────────────────────────────────────────────────
export const seedExpenses: Expense[] = []

// Monthly fixed expenses (3 months)
for (let month = 0; month < 3; month++) {
  const monthStart = addDays(BASE_DATE, month * 30)

  // Rent
  seedExpenses.push({
    id: `exp-rent-${month}`,
    store_id: STORE_ID,
    expense_date: toISO(monthStart),
    category: 'Rent',
    description: 'Monthly shop rent',
    amount: 8000,
    payment_method: 'cash',
    created_at: monthStart.toISOString(),
  })

  // Electricity (varies)
  const electricityDate = addDays(monthStart, 5)
  seedExpenses.push({
    id: `exp-elec-${month}`,
    store_id: STORE_ID,
    expense_date: toISO(electricityDate),
    category: 'Electricity',
    description: 'Electricity bill',
    amount: randInt(2000, 3500),
    payment_method: 'upi',
    created_at: electricityDate.toISOString(),
  })

  // Weekly miscellaneous expenses
  for (let week = 0; week < 4; week++) {
    const miscDate = addDays(monthStart, week * 7 + randInt(0, 6))
    seedExpenses.push({
      id: `exp-misc-${month}-${week}`,
      store_id: STORE_ID,
      expense_date: toISO(miscDate),
      category: 'Miscellaneous',
      description: pickRandom(['Packaging material', 'Cleaning supplies', 'Transport', 'Labour']),
      amount: randInt(500, 2000),
      payment_method: 'cash',
      created_at: miscDate.toISOString(),
    })
  }
}
