INSERT INTO users (name, role, password_hash, company_name)
VALUES
  ('admin', 'admin', '$2b$12$Q1ahOLlsS9HC.o5rs8UQXennmCihodXJjM8SzRMBmW37X43JTJvga', 'Advance Ingredients AG'),
  ('staff', 'staff', '$2b$12$D3AG6KnzC.lnZzc6E/3hkujRhMTchGW86XfgmIOeGR8rtVgVGQhNG', 'Advance Ingredients AG'),
  ('accountant', 'accountant', '$2b$12$n3zrDGH3YTqcaLBCxXhcI.KxX6phK48/CGo8SbmEPduUeKMOC8A8a', 'Advance Ingredients AG'),
  ('dairyfood', 'supplier', '$2b$12$LiCfzLbHSzY7L.1IQMhcHe4Ua7XPi6sBPOQ4VLpLtoLyIRPvVm1f6', 'Dairy Food'),
  ('nongdu', 'customer', '$2b$12$EShRS0qcXmdSSA4jtEWQAuUraU1nKii0gSIfxZzfN6CP/bG5xy6kS', 'Nongdu')
ON CONFLICT (name) DO UPDATE
SET role = EXCLUDED.role,
    password_hash = EXCLUDED.password_hash,
    company_name = EXCLUDED.company_name;
