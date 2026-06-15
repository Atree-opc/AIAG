-- Legacy migration for existing databases only.
-- New environment initialization should use db/schema.sql.
-- Buyer fields are already included in the base schema.

-- Migration: add buyer info fields directly on orders for contract generation
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS buyer_name    VARCHAR(300),
  ADD COLUMN IF NOT EXISTS buyer_address TEXT;
