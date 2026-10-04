# Implementation Plan — Co.Muneeb

> Kirana Store Management + Business Analytics Web App  
> Stack: React 18 + TypeScript + Vite + Tailwind CSS v3 + Supabase + Recharts + Zustand  
> Workspace root: `c:\Users\alokg\OneDrive\Desktop\comunib`

---

## Architecture decisions

**Demo mode via dataLayer abstraction.**  
`src/lib/dataLayer.ts` exports a `getDataLayer(): IDataLayer` factory. When `VITE_SUPABASE_URL` is absent (default for hackathon demo), it returns `LocalDataLayer` which persists to `localStorage` and auto-seeds 90 days of realistic data on first load. When Supabase env vars are present, it returns `SupabaseDataLayer`. All hooks and pages call only `getDataLayer()` — zero conditional Supabase code anywhere else.

**Inventory valuation: weighted average cost.**  
`calcWeightedAvgCost(batches)` in `utils.ts` computes weighted average. `LocalDataLayer` tracks purchase batches and updates the product's weighted avg cost on every purchase. `SupabaseDataLayer` does the same via `purchase_items` table.

**Profit formula.**  
Gross Profit = Revenue − COGS (sum of `cost_price × qty` per `sale_item`).  
Net Profit = Gross Profit − Operating Expenses (from `expenses` table).

**No AI / ML.** All insights are rule-based in `useDashboard.ts`.

**Build verification command for all steps:** `npm run build` from workspace root.

---

- [ ] 1. **Project scaffold — configs, types, utilities, Supabase schema, data layer, seed data**
      Create all non-React files that everything else depends on.
      - `package.json` — all pinned deps exactly as specified; scripts: `dev`, `build`, `preview`
      - `vite.config.ts` — `@vitejs/plugin-react`, alias `@` → `./src`
      - `tsconfig.json` + `tsconfig.node.json` — strict, ESNext, paths for `@/*`
      - `tailwind.config.ts` — custom colors: primary `#6366f1`, success `#10b981`, warning `#f59e0b`, danger `#ef4444`, info `#3b82f6`; font Inter
      - `postcss.config.js` — tailwindcss + autoprefixer
      - `index.html` — Google Fonts Inter, div#root, title "Co.Muneeb — Your Kirana Business, Clearly"
      - `public/favicon.svg` — indigo shopping bag SVG icon
      - `src/vite-env.d.ts` — `ImportMetaEnv` with Supabase vars
      - `src/index.css` — Tailwind directives + Inter font-family + focus ring globals
      - `src/types/index.ts` — All entity interfaces: `Store`, `Category`, `Product`, `Customer`, `Supplier`, `Sale`, `SaleItem`, `Purchase`, `PurchaseItem`, `CustomerTransaction`, `SupplierTransaction`, `Expense`, `InventoryMovement`, `DashboardStats`, `InsightAlert`. Union types: `PaymentMethod = 'cash' | 'upi' | 'credit'`, `TransactionType = 'debit' | 'credit'`
      - `src/lib/supabase.ts` — conditional `createClient`; export `isSupabaseConfigured()`
      - `src/lib/utils.ts` — `formatCurrency` (en-IN ₹), `formatDate`, `cn`, `generateId`, `calcWeightedAvgCost`, `calcDaysRemaining`, `isDeadStock`
      - `src/data/seedData.ts` — 10 products (Rice, Wheat, Sugar, Mustard Oil, Parle-G, Maggi, Lux Soap, Clinic Plus, Tata Tea, Salt), 5 customers, 3 suppliers, 90 days of sales (3–8/day), purchases (2–4/week), monthly expenses
      - `src/lib/dataLayer.ts` — `IDataLayer` interface + `LocalDataLayer` (localStorage + seed init) + `SupabaseDataLayer` + `getDataLayer()` factory
      - `supabase/migrations/001_initial_schema.sql` — 13 tables (stores, categories, products, customers, suppliers, sales, sale_items, purchases, purchase_items, customer_transactions, supplier_transactions, expenses, inventory_movements), RLS policies, `get_user_store_id()` function, auto-create store trigger on auth.users insert
      - `.env.example`
      
      Files: all files listed above  
      Verify: `npm install && npm run build` — zero errors

- [ ] 2. **App shell — auth context, routing, layout, UI primitives, auth pages**
      Depends on step 1 (types, utils, dataLayer).
      - `src/context/AuthContext.tsx` — auto-signs in demo user when Supabase absent; Supabase auth otherwise; `useAuth()` hook with `{user, isAuthenticated, isLoading, isDemo, signIn, signUp, signOut}`
      - `src/context/StoreContext.tsx` — provides `storeId`, `storeName`; `useStore()` hook
      - `src/main.tsx` — `ReactDOM.createRoot`, `<BrowserRouter><AuthProvider><StoreProvider><App/>`
      - `src/App.tsx` — React Router v6 routes: public (`/landing`, `/login`, `/signup`), protected via `<AppLayout>` outlet (`/`, `/inventory`, `/sales`, `/purchases`, `/debtors`, `/debtors/:id`, `/creditors`, `/creditors/:id`, `/expenses`, `/analytics`, `/reports`, `/settings`, `*` → 404)
      - `src/components/layout/Sidebar.tsx` — `Co.Muneeb` brand + tagline, 10 nav items with Lucide icons, active indigo highlight, store name + logout at bottom, `w-64` desktop
      - `src/components/layout/TopBar.tsx` — page title, Quick Entry `+` button, hamburger (mobile), store chip
      - `src/components/layout/MobileNav.tsx` — bottom nav 5 items, fixed, active indigo
      - `src/components/layout/AppLayout.tsx` — sidebar drawer on mobile, sticky top bar, `bg-slate-50` content area, `<Outlet>`
      - UI primitives: `Button` (5 variants, 3 sizes, isLoading spinner), `Card` (title/action slot), `Badge` (6 variants), `Modal` (portal, backdrop, Escape to close, focus trap), `Input` (label, error, prefix ₹), `Select` (label, error), `Table` (generic columns/data, responsive scroll), `DateRangePicker` (presets: Today/7d/Month/30d/3M), `SearchBar` (debounced 300ms), `EmptyState`, `LoadingSpinner`, `AlertBanner`
      - `src/pages/LandingPage.tsx` — hero + 6 feature cards + CTAs
      - `src/pages/LoginPage.tsx` — React Hook Form + Zod, "Continue as Demo" button
      - `src/pages/SignupPage.tsx` — 4 fields + Zod validation
      - Stub pages for all 12 protected routes (replaced in steps 3–4)
      
      Files: all layout, context, UI, and auth page files  
      Verify: `npm run build` — zero errors

- [ ] 3. **Core transactional modules — Dashboard, Inventory, Sales, Purchases, Debtors, Creditors**
      Depends on step 2. Replaces stub pages.
      
      **Hooks** (all in `src/hooks/`):
      - `useDashboard.ts` — `getDashboardStats()` + rule-based `InsightAlert[]` engine (LOW_STOCK, DEAD_STOCK, RESTOCK_SOON, OVERDUE_DEBTOR, OVERDUE_CREDITOR, SALES_TREND_UP, SALES_TREND_DOWN)
      - `useProducts.ts` — CRUD + derived `inventoryValue`, `isLowStock`, `isDead`
      - `useSales.ts` — sales with date filter
      - `usePurchases.ts` — purchases with date filter
      - `useCustomers.ts` — customer CRUD + transaction history + add transaction
      - `useSuppliers.ts` — supplier CRUD + transaction history + add transaction
      - `useExpenses.ts` — expenses with date filter
      
      **Dashboard components** (`src/components/dashboard/`):
      - `StatCard.tsx` — KPI card, trend arrow, color variant
      - `SalesChart.tsx` — Recharts AreaChart, last 30 days, revenue + profit lines
      - `TopProductsChart.tsx` — Recharts BarChart horizontal, top 5 products by qty
      - `ExpenseChart.tsx` — Recharts PieChart, expenses by category
      - `ProfitChart.tsx` — Recharts LineChart, weekly gross vs net profit
      - `InsightsPanel.tsx` — alert list with specific message templates per type
      
      **DashboardPage** — 6 StatCards, SalesChart + InsightsPanel row, TopProductsChart + ExpenseChart row, ProfitChart row. Demo mode banner.
      
      **Inventory** (`src/components/inventory/`):
      - `ProductForm.tsx` — RHF + Zod, live margin % calculation, all product fields
      - `ProductTable.tsx` — search + filter by category/status, colored stock badges
      - `InventoryPage.tsx` — summary chips, ProductTable, Add/Edit modal
      
      **Sales** (`src/components/sales/`):
      - `SaleForm.tsx` — multi-line items, auto-fill price, real-time total + profit
      - `SalesTable.tsx` — date range filter, daily total row
      - `SalesPage.tsx` — DateRangePicker, summary chips, SalesTable, modal
      
      **Purchases** (`src/components/purchases/`):
      - `PurchaseForm.tsx`, `PurchasesTable.tsx`, `PurchasesPage.tsx` — same pattern as Sales
      
      **Debtors** (`src/components/debtors/`):
      - `CustomerForm.tsx`, `CustomerList.tsx` (cards), `CustomerLedger.tsx` (running balance table, Record Payment)
      - `DebtorsPage.tsx` — total receivable banner, list, add modal
      - `DebtorDetailPage.tsx` — reads `:id`, renders CustomerLedger
      
      **Creditors** (`src/components/creditors/`):
      - `SupplierForm.tsx`, `SupplierList.tsx`, `SupplierLedger.tsx`, `CreditorsPage.tsx`, `CreditorDetailPage.tsx`
      
      Files: all hooks, dashboard components, and page files above  
      Verify: `npm run build` — zero errors

- [ ] 4. **Expenses, Analytics, Reports, Settings, Quick Entry, and polish**
      Depends on step 3. Independent file ownership — no overlap with step 3 files.
      
      **Expenses:**
      - `src/components/expenses/ExpenseForm.tsx` — RHF + Zod, category select with "Other" custom input
      - `src/components/expenses/ExpenseTable.tsx` — category filter, period total footer
      - `src/pages/ExpensesPage.tsx` — DateRangePicker, category bar chart, ExpenseTable
      
      **Analytics page** (`src/pages/AnalyticsPage.tsx`):
      - Tab 1 — Sales Analytics: top products bar, payment method pie, daily sales area, day-of-week bar, this-vs-last-month grouped bar
      - Tab 2 — Inventory Analytics: valuation table, category pie, fast movers list, dead stock list, restock prediction table with days-remaining calculation
      - Tab 3 — P&L: DateRangePicker, P&L summary card (Revenue, COGS, Gross Profit, Expenses, Net Profit), monthly P&L table with margin %
      
      **Reports page** (`src/pages/ReportsPage.tsx`):
      - 6 report cards: Sales CSV (papaparse), Purchase CSV, Expense CSV, Debtor CSV, Inventory CSV, P&L PDF (jsPDF + jspdf-autotable)
      - DateRangePicker applies to all downloads
      - Success toast on download
      
      **Settings page** (`src/pages/SettingsPage.tsx`):
      - Store Settings tab: name, address, phone (read-only currency INR, timezone IST)
      - Categories tab: list with color swatches, add category form, delete if unused
      - Demo Data tab (demo mode only): Reset Demo Data button
      
      **Quick Entry** (`src/components/quick-entry/QuickEntryModal.tsx`):
      - FAB fixed bottom-right (all protected pages via AppLayout)
      - 3 tabs: Quick Sale, Quick Purchase, Quick Expense
      - Minimal fields, success toast, stays open for rapid entry
      
      **Toast system** (`src/components/ui/Toast.tsx` + `src/hooks/useToast.ts`):
      - Context + provider, fixed top-right stack, auto-dismiss 3s
      - Wire into `src/main.tsx`
      - Call in all form submit handlers
      
      **Loading/error states:** every page shows `<LoadingSpinner>` while loading, `<AlertBanner variant='error'>` + Retry on error.
      
      **404 page** (`src/pages/NotFoundPage.tsx`) + catch-all route in App.tsx.
      
      **Mobile audit fixes:** overflow-x-auto on all tables, modal responsive sizing, DateRangePicker stacks on mobile, 2-col stat grid on mobile.
      
      **Keyboard accessibility:** Modal focus trap, focus rings (`focus:ring-2 focus:ring-indigo-500`), nav uses `<Link>`, table rows with keyboard handlers.
      
      **Performance:** `useMemo` on insight alerts, inventory value, P&L aggregations. `React.lazy()` + `Suspense` for Recharts-heavy pages if bundle > 2MB.
      
      **README.md:** About, Features, Tech Stack, Getting Started, Demo Mode, Supabase Setup, License MIT.
      
      Files: expenses components/page, AnalyticsPage, ReportsPage, SettingsPage, QuickEntryModal, Toast system, NotFoundPage, README.md; updates to AppLayout, main.tsx, App.tsx  
      Verify: `npm run build` — zero errors, no circular dependency warnings

---

## Dependency order

```
FEAT-001 (scaffold) → FEAT-002 (shell/UI) → FEAT-003 (core modules) → FEAT-004 (analytics/reports) → FEAT-005 (polish)
```

Each FEAT leaves the codebase in a buildable state (`npm run build` passes).

## Key implementation notes for the coder

### Currency
```ts
// Always use this:
new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
// Result: ₹1,25,000
```

### Demo mode detection
```ts
// In dataLayer.ts:
export function getDataLayer(): IDataLayer {
  return isSupabaseConfigured() ? supabaseLayerSingleton : localLayerSingleton;
}
```

### Restock prediction
```ts
// In useDashboard.ts:
const daysRemaining = calcDaysRemaining(product.current_stock, unitsSoldLast30);
// calcDaysRemaining: stock / (sold30 / 30), returns Infinity if sold30 === 0
```

### Weighted average cost update on purchase
```ts
// On adding a purchase item:
const newAvgCost = calcWeightedAvgCost([
  { qty: product.current_stock, price: product.purchase_price },
  { qty: purchasedQty, price: purchaseUnitPrice }
]);
// Then update product.purchase_price = newAvgCost, product.current_stock += purchasedQty
```

### Gross profit per sale
```ts
// sale_items must store cost_price at time of sale (snapshot of product.purchase_price)
grossProfit = saleItems.reduce((sum, item) => 
  sum + (item.unit_price - item.cost_price) * item.quantity, 0);
```

### RLS pattern (Supabase)
```sql
CREATE POLICY "store_isolation" ON products
  FOR ALL USING (store_id = get_user_store_id());
```

### Tailwind color tokens (use these class names)
```
indigo-600 = primary actions
emerald-500 = success/profit  
amber-500  = warnings/low stock
red-500    = errors/danger/loss
blue-500   = info
slate-50   = page background
```
