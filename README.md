# Co.Muneeb — Smart Kirana Store Analytics

> **"Your Kirana Business, Clearly."**

Co.Muneeb is a simple business management and analytics tool for small Indian Kirana stores. Track sales, stock, credit, expenses and profits in one clean dashboard.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — demo data loads automatically, no setup needed.

---

## Demo Mode

- Works **entirely in the browser** using `localStorage`
- No database, no Supabase, no account required
- 90 days of realistic seed data pre-loaded on first visit
- Reset demo data anytime from Settings

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Charts | Recharts |
| Routing | React Router v6 |
| Data Storage | localStorage (demo) / Supabase (optional) |
| CSV Export | PapaParse |

---

## Features

- **Dashboard** — financial stats, charts, smart insights
- **Inventory** — product management with low-stock alerts
- **Sales** — record sales, track revenue and gross profit
- **Purchases** — supplier purchases, stock auto-updates
- **Debtors (Customer Khata)** — credit tracking per customer
- **Creditors (Suppliers)** — payable tracking per supplier
- **Expenses** — categorised expense tracking
- **Analytics** — P&L, product performance, date-range filtering
- **Reports** — export any table as CSV, print support

---

## Optional: Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor
3. Copy `.env.example` to `.env.local` and fill in your values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The app automatically switches from localStorage to Supabase when these variables are set.

---

## Vercel Deployment

```bash
# Build
npm run build

# Deploy (install Vercel CLI first)
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments. No special configuration needed — it's a standard Vite SPA.

Add environment variables in Vercel dashboard if using Supabase.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Optional | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Optional | Supabase anonymous key |

If neither is set, the app runs in **Demo Mode** using localStorage.

---

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI primitives
│   ├── layout/       # Sidebar, TopBar, MobileNav
│   ├── quick-entry/  # Quick Add modal
│   ├── inventory/    # Product form
│   ├── sales/        # Sale form
│   ├── purchases/    # Purchase form
│   ├── debtors/      # Customer form + ledger
│   ├── creditors/    # Supplier form + ledger
│   └── expenses/     # Expense form
├── pages/            # One file per route
├── lib/
│   ├── dataLayer.ts  # Data access layer (localStorage + Supabase)
│   ├── utils.ts      # Formatting helpers
│   └── supabase.ts   # Supabase client factory
├── data/
│   └── seedData.ts   # 90-day demo dataset
└── types/
    └── index.ts      # TypeScript type definitions
```

---

## Currency

All values use Indian Rupee (₹) formatting via `Intl.NumberFormat('en-IN')`.

Example: `₹1,24,800` (Indian lakh notation)
