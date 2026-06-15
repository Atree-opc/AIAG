ALTER TABLE order_files
ADD COLUMN IF NOT EXISTS category_code VARCHAR(50) NOT NULL DEFAULT 'uncategorized';

UPDATE order_files
SET category_code = 'uncategorized'
WHERE category_code IS NULL OR category_code = '';

CREATE TABLE IF NOT EXISTS order_file_categories (
  category_code   VARCHAR(50) PRIMARY KEY,
  label_en        VARCHAR(100) NOT NULL,
  label_zh        VARCHAR(100) NOT NULL,
  sort_order      INT NOT NULL DEFAULT 0,
  required        BOOLEAN NOT NULL DEFAULT true,
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
  ('bill_of_exchange', 'Bill of Exchange', '汇票', 3, true),
  ('ippc', 'IPPC', 'IPPC', 4, true),
  ('scanned_copy', 'Scanned Copy', '扫描件', 5, true),
  ('lc', 'L/C', '信用证', 6, true),
  ('uncategorized', 'Uncategorized', '未分类', 99, false)
ON CONFLICT (category_code) DO UPDATE SET
  label_en = EXCLUDED.label_en,
  label_zh = EXCLUDED.label_zh,
  sort_order = EXCLUDED.sort_order,
  required = EXCLUDED.required;

INSERT INTO order_file_checklist (container_number, category_code, status)
SELECT o.container_number, c.category_code, 'missing'
FROM orders o
CROSS JOIN order_file_categories c
ON CONFLICT (container_number, category_code) DO NOTHING;

UPDATE order_file_checklist checklist
SET status = CASE
  WHEN stats.file_count > 0 AND checklist.status = 'missing' THEN 'uploaded'
  WHEN stats.file_count = 0 THEN 'missing'
  ELSE checklist.status
END,
updated_at = NOW()
FROM (
  SELECT container_number, category_code, COUNT(*)::int AS file_count
  FROM order_files
  GROUP BY container_number, category_code
) stats
WHERE checklist.container_number = stats.container_number
  AND checklist.category_code = stats.category_code;
