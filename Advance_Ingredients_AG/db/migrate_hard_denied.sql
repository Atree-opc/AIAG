-- Legacy migration for existing databases only.
-- New environment initialization should use db/schema.sql.

CREATE TABLE IF NOT EXISTS hard_denied_info (
  field_key VARCHAR(50) PRIMARY KEY
);
