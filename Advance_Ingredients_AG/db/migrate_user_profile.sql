-- Legacy migration for existing databases only.
-- New environment initialization should use db/schema.sql.
-- User profile fields are already included in the base schema.

-- Migration: add profile fields to users table

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS company_name  VARCHAR(300),
  ADD COLUMN IF NOT EXISTS address       TEXT,
  ADD COLUMN IF NOT EXISTS city          VARCHAR(100),
  ADD COLUMN IF NOT EXISTS country       VARCHAR(100);
