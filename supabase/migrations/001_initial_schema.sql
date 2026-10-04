-- Co.Muneeb — Initial Schema
-- Valuation method: weighted average cost (documented in code)
-- RLS: all tables protected, users see only their own store data

-- ─── Helper function ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_user_store_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM stores WHERE owner_id = auth.uid() LIMIT 1;
$$;

-- ─── Stores ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stores (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL DEFAULT 'My Store',
  address     text,
  phone       text,
  gstin       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own store"
  ON stores
  FOR ALL
  USING (owner_id = auth.uid());

-- ─── Auto-create store on user signup ────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_store_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO stores (owner_id, name)
  VALUES (NEW.id, 'My Store');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_store_for_new_user();

-- ─── Categories ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id  uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name      text NOT NULL,
  color     text,
  icon      text
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their store categories"
  ON categories
  FOR ALL
  USING (store_id = get_user_store_id());

-- ─── Suppliers ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS suppliers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name             text NOT NULL,
  contact_person   text,
  mobile           text,
  address          text,
  opening_balance  numeric(10,2) NOT NULL DEFAULT 0,
  current_balance  numeric(10,2) NOT NULL DEFAULT 0,
  due_date         date,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their store suppliers"
  ON suppliers
  FOR ALL
  USING (store_id = get_user_store_id());

-- ─── Products ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id      uuid REFERENCES categories(id) ON DELETE SET NULL,
  name             text NOT NULL,
  sku              text,
  brand            text,
  unit             text NOT NULL,
  purchase_price   numeric(10,2) NOT NULL,
  selling_price    numeric(10,2) NOT NULL,
  current_stock    numeric(10,3) NOT NULL DEFAULT 0,
  min_stock_level  numeric(10,3) NOT NULL DEFAULT 0,
  supplier_id      uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  expiry_date      date,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their store products"
  ON products
  FOR ALL
  USING (store_id = get_user_store_id());

-- ─── Customers ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name             text NOT NULL,
  mobile           text,
  address          text,
  opening_balance  numeric(10,2) NOT NULL DEFAULT 0,
  current_balance  numeric(10,2) NOT NULL DEFAULT 0,
  due_date         date,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their store customers"
  ON customers
  FOR ALL
  USING (store_id = get_user_store_id());

-- ─── Sales ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sales (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id     uuid REFERENCES customers(id) ON DELETE SET NULL,
  sale_date       date NOT NULL,
  total_amount    numeric(10,2) NOT NULL DEFAULT 0,
  discount        numeric(10,2) NOT NULL DEFAULT 0,
  payment_method  text NOT NULL CHECK (payment_method IN ('cash', 'upi', 'credit')),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their store sales"
  ON sales
  FOR ALL
  USING (store_id = get_user_store_id());

-- ─── Sale Items ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sale_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id      uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id   uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity     numeric(10,3) NOT NULL,
  unit_price   numeric(10,2) NOT NULL,
  cost_price   numeric(10,2) NOT NULL DEFAULT 0,
  total_price  numeric(10,2) NOT NULL
);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their store sale items"
  ON sale_items
  FOR ALL
  USING (
    sale_id IN (
      SELECT id FROM sales WHERE store_id = get_user_store_id()
    )
  );

-- ─── Purchases ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS purchases (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  supplier_id     uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  purchase_date   date NOT NULL,
  total_amount    numeric(10,2) NOT NULL DEFAULT 0,
  payment_status  text NOT NULL CHECK (payment_status IN ('paid', 'credit', 'partial')),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their store purchases"
  ON purchases
  FOR ALL
  USING (store_id = get_user_store_id());

-- ─── Purchase Items ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS purchase_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id   uuid NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity      numeric(10,3) NOT NULL,
  unit_price    numeric(10,2) NOT NULL,
  total_price   numeric(10,2) NOT NULL
);

ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their store purchase items"
  ON purchase_items
  FOR ALL
  USING (
    purchase_id IN (
      SELECT id FROM purchases WHERE store_id = get_user_store_id()
    )
  );

-- ─── Customer Transactions ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customer_transactions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id          uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id       uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  transaction_date  date NOT NULL,
  description       text NOT NULL,
  debit_amount      numeric(10,2) NOT NULL DEFAULT 0,
  credit_amount     numeric(10,2) NOT NULL DEFAULT 0,
  balance           numeric(10,2) NOT NULL DEFAULT 0,
  transaction_type  text NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
  reference_id      uuid
);

ALTER TABLE customer_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their store customer transactions"
  ON customer_transactions
  FOR ALL
  USING (store_id = get_user_store_id());

-- ─── Supplier Transactions ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS supplier_transactions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id          uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  supplier_id       uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  transaction_date  date NOT NULL,
  description       text NOT NULL,
  debit_amount      numeric(10,2) NOT NULL DEFAULT 0,
  credit_amount     numeric(10,2) NOT NULL DEFAULT 0,
  balance           numeric(10,2) NOT NULL DEFAULT 0,
  transaction_type  text NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
  reference_id      uuid
);

ALTER TABLE supplier_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their store supplier transactions"
  ON supplier_transactions
  FOR ALL
  USING (store_id = get_user_store_id());

-- ─── Expenses ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS expenses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  expense_date    date NOT NULL,
  category        text NOT NULL,
  description     text,
  amount          numeric(10,2) NOT NULL,
  payment_method  text CHECK (payment_method IN ('cash', 'upi', 'credit')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their store expenses"
  ON expenses
  FOR ALL
  USING (store_id = get_user_store_id());

-- ─── Inventory Movements ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inventory_movements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id      uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_date   timestamptz NOT NULL DEFAULT now(),
  movement_type   text NOT NULL CHECK (movement_type IN ('sale', 'purchase', 'adjustment')),
  quantity_change numeric(10,3) NOT NULL,
  reference_id    uuid,
  notes           text
);

ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their store inventory movements"
  ON inventory_movements
  FOR ALL
  USING (store_id = get_user_store_id());

-- ─── Indexes for performance ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_store_date ON sales(store_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_purchases_store_date ON purchases(store_id, purchase_date);
CREATE INDEX IF NOT EXISTS idx_expenses_store_date ON expenses(store_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_customer_tx_customer ON customer_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_supplier_tx_supplier ON supplier_transactions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);
