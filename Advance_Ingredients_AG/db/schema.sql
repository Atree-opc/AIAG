CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL UNIQUE,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('admin','staff','supplier','customer','accountant')),
  password_hash VARCHAR(255) NOT NULL,
  company_name  VARCHAR(300),
  address       TEXT,
  city          VARCHAR(100),
  country       VARCHAR(100),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  container_number   VARCHAR(50) PRIMARY KEY,
  contract_id        VARCHAR(100),
  customer_id        UUID REFERENCES users(user_id),
  supplier_id        UUID REFERENCES users(user_id),
  bl                 VARCHAR(100),
  brand              VARCHAR(100),
  product            VARCHAR(200),
  price              DECIMAL(10,4),
  quantity           DECIMAL(10,2),
  quantity_unit      VARCHAR(10) DEFAULT 'MT',
  loading_date       DATE,
  etd                DATE,
  ship_on_board_date DATE,
  eta                DATE,
  batch_no           VARCHAR(100),
  production_date    DATE,
  df_invoice_no      VARCHAR(100),
  df_ai_price        DECIMAL(10,4),
  freight_forwarder  VARCHAR(200),
  freight_forwarder_method VARCHAR(200),
  lc_number          VARCHAR(100),
  port_of_loading    VARCHAR(100),
  port_of_discharge  VARCHAR(100),
  status             VARCHAR(30) DEFAULT 'pending',
  remarks            TEXT,
  belonged_month     VARCHAR(7),
  belonged_quarter   VARCHAR(7),
  -- Invoice / document fields
  parity             VARCHAR(200),
  packing            TEXT,
  payment_terms      VARCHAR(200),
  origin             VARCHAR(100),
  shelf_life         VARCHAR(200),
  invoice_no         VARCHAR(50),
  lc_issue_date      DATE,
  lc_bank_name       VARCHAR(200),
  lc_bank_bic        VARCHAR(50),
  lc_bank_address    TEXT,
  -- Buyer info (per-order, for contract generation)
  buyer_name         VARCHAR(300),
  buyer_address      TEXT,
  -- Organic product fields
  is_organic         BOOLEAN DEFAULT false,
  tc_contract_no     VARCHAR(100),
  tc_invoice_no      VARCHAR(100),
  tc_seller          VARCHAR(300),
  tc_buyer           VARCHAR(300),
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_visibility (
  container_number VARCHAR(50) REFERENCES orders(container_number) ON DELETE CASCADE,
  role             VARCHAR(20) CHECK (role IN ('staff','supplier','customer','accountant')),
  PRIMARY KEY (container_number, role)
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_belonged_month ON orders(belonged_month);
CREATE INDEX IF NOT EXISTS idx_orders_belonged_quarter ON orders(belonged_quarter);
CREATE INDEX IF NOT EXISTS idx_order_visibility_role_container ON order_visibility(role, container_number);

-- File storage
CREATE TABLE IF NOT EXISTS order_files (
  file_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_number     VARCHAR(50) REFERENCES orders(container_number) ON DELETE CASCADE,
  filename             VARCHAR(255) NOT NULL,
  stored_name          VARCHAR(255) NOT NULL UNIQUE,
  file_size            BIGINT,
  mime_type            VARCHAR(100),
  uploaded_by          UUID REFERENCES users(user_id),
  uploaded_at            TIMESTAMPTZ DEFAULT NOW(),
  category_code          VARCHAR(50) NOT NULL DEFAULT 'uncategorized',
  visible_to_customer    BOOLEAN NOT NULL DEFAULT false,
  visible_to_supplier    BOOLEAN NOT NULL DEFAULT false,
  visible_to_accountant  BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS order_file_categories (
  category_code   VARCHAR(50) PRIMARY KEY,
  label_en        VARCHAR(100) NOT NULL,
  label_zh        VARCHAR(100) NOT NULL,
  sort_order      INT NOT NULL DEFAULT 0,
  required        BOOLEAN NOT NULL DEFAULT true,
  visible_to_supplier   BOOLEAN NOT NULL DEFAULT false,
  visible_to_customer   BOOLEAN NOT NULL DEFAULT false,
  visible_to_accountant BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_file_checklist (
  container_number VARCHAR(50) NOT NULL REFERENCES orders(container_number) ON DELETE CASCADE,
  category_code    VARCHAR(50) NOT NULL REFERENCES order_file_categories(category_code),
  status           VARCHAR(20) NOT NULL DEFAULT 'missing' CHECK (status IN ('missing','uploaded','reviewing','approved','rejected')),
  note             TEXT,
  updated_by       UUID REFERENCES users(user_id),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (container_number, category_code)
);

CREATE INDEX IF NOT EXISTS idx_order_files_container_category ON order_files(container_number, category_code);
CREATE INDEX IF NOT EXISTS idx_order_file_checklist_container_category ON order_file_checklist(container_number, category_code);

INSERT INTO order_file_categories (category_code, label_en, label_zh, sort_order, required) VALUES
  ('contract', 'Contract', '合同', 1, true),
  ('invoice', 'Invoice', '发票', 2, true),
  ('df_invoice', 'DF Invoice', 'DF发票', 3, true),
  ('bill_of_exchange', 'Bill of Exchange', '汇票', 4, true),
  ('ippc', 'IPPC', 'IPPC', 5, true),
  ('scanned_copy', 'Scanned Copy', '扫描件', 6, true),
  ('lc', 'L/C', '信用证', 7, true),
  ('lc_payment_fee_proof', 'L/C Payment Proof & Fees', '信用证付款证明与手续费', 8, false),
  ('uncategorized', 'Uncategorized', '未分类', 99, false)
ON CONFLICT (category_code) DO NOTHING;

-- Role field visibility: which order fields each role can see (whitelist)
CREATE TABLE IF NOT EXISTS role_field_visibility (
  role      VARCHAR(20) NOT NULL,
  field_key VARCHAR(50) NOT NULL,
  editable  BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (role, field_key)
);

-- Fields that are forcibly hidden from all roles
CREATE TABLE IF NOT EXISTS hard_denied_info (
  field_key VARCHAR(50) PRIMARY KEY
);

-- Default visibility for customer
INSERT INTO role_field_visibility (role, field_key) VALUES
  ('customer', 'container_number'),
  ('customer', 'contract_id'),
  ('customer', 'brand'),
  ('customer', 'product'),
  ('customer', 'quantity'),
  ('customer', 'etd'),
  ('customer', 'ship_on_board_date'),
  ('customer', 'eta'),
  ('customer', 'port_of_loading'),
  ('customer', 'port_of_discharge'),
  ('customer', 'batch_no'),
  ('customer', 'status'),
  ('customer', 'remarks')
ON CONFLICT DO NOTHING;

-- Default visibility for supplier
INSERT INTO role_field_visibility (role, field_key) VALUES
  ('supplier', 'container_number'),
  ('supplier', 'contract_id'),
  ('supplier', 'brand'),
  ('supplier', 'product'),
  ('supplier', 'quantity'),
  ('supplier', 'batch_no'),
  ('supplier', 'production_date'),
  ('supplier', 'loading_date'),
  ('supplier', 'etd'),
  ('supplier', 'ship_on_board_date'),
  ('supplier', 'eta'),
  ('supplier', 'port_of_loading'),
  ('supplier', 'port_of_discharge'),
  ('supplier', 'freight_forwarder'),
  ('supplier', 'df_invoice_no'),
  ('supplier', 'status'),
  ('supplier', 'remarks')
ON CONFLICT DO NOTHING;

-- Configurable dropdown options (admin-managed)
CREATE TABLE IF NOT EXISTS order_options (
  option_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_type VARCHAR(50) NOT NULL,
  value       TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (option_type, value)
);

INSERT INTO order_options (option_type, value, sort_order) VALUES
  ('parity', 'CIF Tianjin, Xingang,China (Incoterms 2020)', 1),
  ('parity', 'DAP Beijing, China (Incoterms 2020)', 2),
  ('parity', 'DAP Shanghai, China (Incoterms 2020)', 3),
  ('payment_terms', 'L/C 90 days after B/L date', 1),
  ('payment_terms', 'T/T 100% payment 30 days after shipment', 2),
  ('payment_terms', 'T/T 100% payment 60 days after shipment', 3)
ON CONFLICT DO NOTHING;

-- Default visibility for staff (full access to most fields)
INSERT INTO role_field_visibility (role, field_key, editable) VALUES
  ('staff', 'container_number',        false),
  ('staff', 'contract_id',             true),
  ('staff', 'customer_id',             true),
  ('staff', 'supplier_id',             true),
  ('staff', 'bl',                      true),
  ('staff', 'brand',                   true),
  ('staff', 'product',                 true),
  ('staff', 'price',                   true),
  ('staff', 'quantity',                true),
  ('staff', 'quantity_unit',           true),
  ('staff', 'loading_date',            true),
  ('staff', 'etd',                     true),
  ('staff', 'ship_on_board_date',      true),
  ('staff', 'eta',                     true),
  ('staff', 'batch_no',                true),
  ('staff', 'production_date',         true),
  ('staff', 'df_invoice_no',           true),
  ('staff', 'df_ai_price',             true),
  ('staff', 'freight_forwarder',       true),
  ('staff', 'freight_forwarder_method', true),
  ('staff', 'lc_number',               true),
  ('staff', 'port_of_loading',         true),
  ('staff', 'port_of_discharge',       true),
  ('staff', 'status',                  true),
  ('staff', 'remarks',                 true),
  ('staff', 'belonged_month',          true),
  ('staff', 'belonged_quarter',        true),
  ('staff', 'invoice_no',              true),
  ('staff', 'parity',                  true),
  ('staff', 'payment_terms',           true),
  ('staff', 'packing',                 true),
  ('staff', 'origin',                  true),
  ('staff', 'shelf_life',              true),
  ('staff', 'lc_issue_date',           true),
  ('staff', 'lc_bank_name',            true),
  ('staff', 'lc_bank_bic',             true),
  ('staff', 'lc_bank_address',         true),
  ('staff', 'buyer_name',              true),
  ('staff', 'buyer_address',           true),
  ('staff', 'is_organic',              true),
  ('staff', 'tc_contract_no',          true),
  ('staff', 'tc_invoice_no',           true),
  ('staff', 'tc_seller',               true),
  ('staff', 'tc_buyer',                true)
ON CONFLICT DO NOTHING;

-- Accountant-only file storage (physically isolated from order files)
CREATE TABLE IF NOT EXISTS accountant_files (
  file_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year         SMALLINT NOT NULL,
  month        SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  filename     VARCHAR(255) NOT NULL,
  stored_name  VARCHAR(255) NOT NULL UNIQUE,
  file_size    BIGINT,
  mime_type    VARCHAR(100),
  uploaded_by  UUID REFERENCES users(user_id),
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Default visibility for accountant (read-only fields)
INSERT INTO role_field_visibility (role, field_key, editable) VALUES
  ('accountant', 'container_number',   false),
  ('accountant', 'contract_id',        false),
  ('accountant', 'brand',              false),
  ('accountant', 'product',            false),
  ('accountant', 'quantity',           false),
  ('accountant', 'price',              false),
  ('accountant', 'invoice_no',         false),
  ('accountant', 'parity',             false),
  ('accountant', 'payment_terms',      false),
  ('accountant', 'lc_number',          false),
  ('accountant', 'lc_issue_date',      false),
  ('accountant', 'lc_bank_name',       false),
  ('accountant', 'lc_bank_bic',        false),
  ('accountant', 'lc_bank_address',    false),
  ('accountant', 'buyer_name',         false),
  ('accountant', 'buyer_address',      false),
  ('accountant', 'status',             false)
ON CONFLICT DO NOTHING;

-- Month grouping (auto-filled from etd, manually adjustable by admin)
CREATE TABLE IF NOT EXISTS order_month (
  container_number VARCHAR(50) PRIMARY KEY REFERENCES orders(container_number) ON DELETE CASCADE,
  year             SMALLINT NOT NULL,
  month            SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  updated_by       UUID REFERENCES users(user_id),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Quarter grouping (auto-filled from etd, manually adjustable by admin)
CREATE TABLE IF NOT EXISTS order_quarter (
  container_number VARCHAR(50) PRIMARY KEY REFERENCES orders(container_number) ON DELETE CASCADE,
  year             SMALLINT NOT NULL,
  quarter          SMALLINT NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  updated_by       UUID REFERENCES users(user_id),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
