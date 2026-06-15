-- Legacy migration for existing databases only.
-- New environment initialization should use db/schema.sql.
-- Invoice fields and order_options are already included in the base schema.

-- Migration: add invoice/document fields to orders + option config tables

-- New fields on orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS parity          VARCHAR(200),
  ADD COLUMN IF NOT EXISTS packing         TEXT,
  ADD COLUMN IF NOT EXISTS payment_terms   VARCHAR(200),
  ADD COLUMN IF NOT EXISTS origin          VARCHAR(100),
  ADD COLUMN IF NOT EXISTS shelf_life      VARCHAR(200),
  ADD COLUMN IF NOT EXISTS invoice_no      VARCHAR(50),
  ADD COLUMN IF NOT EXISTS lc_issue_date   DATE,
  ADD COLUMN IF NOT EXISTS lc_bank_name    VARCHAR(200),
  ADD COLUMN IF NOT EXISTS lc_bank_bic     VARCHAR(50),
  ADD COLUMN IF NOT EXISTS lc_bank_address TEXT;

-- Configurable dropdown options (admin-managed)
CREATE TABLE IF NOT EXISTS order_options (
  option_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_type VARCHAR(50) NOT NULL,  -- 'parity' | 'payment_terms'
  value       TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (option_type, value)
);

-- Default parity options
INSERT INTO order_options (option_type, value, sort_order) VALUES
  ('parity', 'CIF Tianjin, Xingang,China (Incoterms 2020)', 1),
  ('parity', 'DAP Beijing, China (Incoterms 2020)', 2),
  ('parity', 'DAP Shanghai, China (Incoterms 2020)', 3)
ON CONFLICT DO NOTHING;

-- Default payment_terms options
INSERT INTO order_options (option_type, value, sort_order) VALUES
  ('payment_terms', 'L/C 90 days after B/L date', 1),
  ('payment_terms', 'T/T 100% payment 30 days after shipment', 2),
  ('payment_terms', 'T/T 100% payment 60 days after shipment', 3)
ON CONFLICT DO NOTHING;
