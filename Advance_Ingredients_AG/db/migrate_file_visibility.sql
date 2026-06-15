-- Migration: add file visibility columns to order_files
-- Run this against your existing database

ALTER TABLE order_files
  ADD COLUMN IF NOT EXISTS visible_to_customer BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS visible_to_supplier BOOLEAN NOT NULL DEFAULT false;

-- Backfill: files uploaded by suppliers should be visible to supplier
UPDATE order_files f
SET visible_to_supplier = true
FROM users u
WHERE f.uploaded_by = u.user_id AND u.role = 'supplier';
