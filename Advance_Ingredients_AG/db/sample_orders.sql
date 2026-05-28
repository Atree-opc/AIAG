-- Sample orders for Advance Ingredients AG
-- Requires users to be seeded first (seed.ts)

DO $$
DECLARE
  u_fonterra    UUID;
  u_arla        UUID;
  u_lactalis    UUID;
  u_chinadairy  UUID;
  u_shanghai    UUID;
  u_beijing     UUID;
  u_guangzhou   UUID;
  u_shenzhen    UUID;
BEGIN

SELECT user_id INTO u_fonterra   FROM users WHERE name = 'Fonterra';
SELECT user_id INTO u_arla       FROM users WHERE name = 'Arla';
SELECT user_id INTO u_lactalis   FROM users WHERE name = 'Lactalis';
SELECT user_id INTO u_chinadairy FROM users WHERE name = 'ChinaDairy';
SELECT user_id INTO u_shanghai   FROM users WHERE name = 'ShanghaiFood';
SELECT user_id INTO u_beijing    FROM users WHERE name = 'BeijingTrade';
SELECT user_id INTO u_guangzhou  FROM users WHERE name = 'GuangzhouImp';
SELECT user_id INTO u_shenzhen   FROM users WHERE name = 'ShenzhenCo';

INSERT INTO orders (
  container_number, contract_id, customer_id, supplier_id, shelf, brand, product,
  price, quantity, quantity_unit, loading_date, etd, ship_on_board_date, eta,
  batch_no, production_date, df_invoice_no, df_ai_price,
  freight_forwarder, lc_number, port_of_loading, port_of_discharge,
  status, remarks, belonged_month, belonged_quarter
) VALUES
  ('AIAG-2025-001','CT-2025-001',u_chinadairy, u_fonterra, 'A1','Fonterra','Whole Milk Powder',
   3.2500,22.00,'MT','2025-01-10','2025-01-15','2025-01-16','2025-02-20',
   'FNT-250101','2024-12-20','DF-INV-001',2.9800,
   'Kuehne+Nagel','LC-2025-001','Auckland','Hamburg',
   'completed',NULL,'2025-01','2025-Q1'),

  ('AIAG-2025-002','CT-2025-002',u_shanghai,   u_arla,     'B3','Arla','Skimmed Milk Powder',
   2.8800,18.50,'MT','2025-02-05','2025-02-10','2025-02-11','2025-03-18',
   'ARL-250201','2025-01-15','DF-INV-002',2.6500,
   'DB Schenker','LC-2025-002','Rotterdam','Shanghai',
   'completed','Urgent delivery','2025-02','2025-Q1'),

  ('AIAG-2025-003','CT-2025-003',u_beijing,    u_lactalis, 'C2','Lactalis','Whey Protein Concentrate 80%',
   5.1200,10.00,'MT','2025-03-12','2025-03-18','2025-03-19','2025-04-25',
   'LAC-250301','2025-02-28','DF-INV-003',4.8500,
   'Panalpina',NULL,'Le Havre','Guangzhou',
   'completed',NULL,'2025-03','2025-Q1'),

  ('AIAG-2025-004','CT-2025-004',u_guangzhou,  u_fonterra, 'A2','Fonterra','Lactose Monohydrate',
   1.4500,25.00,'MT','2025-04-08','2025-04-14','2025-04-15','2025-05-22',
   'FNT-250401','2025-03-20','DF-INV-004',1.3200,
   'Kuehne+Nagel','LC-2025-004','Auckland','Tianjin',
   'completed',NULL,'2025-04','2025-Q2'),

  ('AIAG-2025-005','CT-2025-005',u_shenzhen,   u_arla,     'D1','Arla','Butter 82% Fat',
   6.7500,15.00,'MT','2025-05-20','2025-05-26','2025-05-27','2025-07-02',
   'ARL-250501','2025-05-01','DF-INV-005',6.4000,
   'Geodis','LC-2025-005','Aarhus','Qingdao',
   'completed','Cold chain required','2025-05','2025-Q2'),

  ('AIAG-2025-006','CT-2025-006',u_chinadairy, u_lactalis, 'B1','Lactalis','Casein Micellar',
   8.9000,8.00,'MT','2025-06-15','2025-06-20','2025-06-21','2025-07-28',
   'LAC-250601','2025-05-30','DF-INV-006',8.5500,
   'DB Schenker',NULL,'Le Havre','Shanghai',
   'completed',NULL,'2025-06','2025-Q2'),

  ('AIAG-2025-007','CT-2025-007',u_shanghai,   u_fonterra, 'C3','Fonterra','Anhydrous Milk Fat',
   7.3200,12.00,'MT','2025-07-05','2025-07-11','2025-07-12','2025-08-18',
   'FNT-250701','2025-06-20','DF-INV-007',7.0000,
   'Panalpina','LC-2025-007','Auckland','Ningbo',
   'completed',NULL,'2025-07','2025-Q3'),

  ('AIAG-2025-008','CT-2025-008',u_beijing,    u_arla,     'A3','Arla','Whey Powder Sweet',
   1.9800,20.00,'MT','2025-08-10','2025-08-16','2025-08-17','2025-09-22',
   'ARL-250801','2025-07-25','DF-INV-008',1.8200,
   'Kuehne+Nagel','LC-2025-008','Rotterdam','Shenzhen',
   'arrived',NULL,'2025-08','2025-Q3'),

  ('AIAG-2025-009','CT-2025-009',u_guangzhou,  u_lactalis, 'B2','Lactalis','Cream Powder 42%',
   4.5500,16.00,'MT','2025-09-18','2025-09-24','2025-09-25','2025-11-01',
   'LAC-250901','2025-09-01','DF-INV-009',4.2800,
   'Geodis',NULL,'Cherbourg','Guangzhou',
   'arrived',NULL,'2025-09','2025-Q3'),

  ('AIAG-2025-010','CT-2025-010',u_shenzhen,   u_fonterra, 'D2','Fonterra','Whole Milk Powder',
   3.3500,20.00,'MT','2025-10-10','2025-10-16',NULL,'2025-11-22',
   'FNT-251001','2025-09-25','DF-INV-010',3.1000,
   'DB Schenker','LC-2025-010','Auckland','Shenzhen',
   'shipped',NULL,'2025-10','2025-Q4'),

  ('AIAG-2025-011','CT-2025-011',u_chinadairy, u_arla,     'C1','Arla','Skimmed Milk Powder',
   2.9500,18.00,'MT','2025-10-20','2025-10-26',NULL,'2025-12-02',
   'ARL-251001','2025-10-05','DF-INV-011',2.7200,
   'Kuehne+Nagel',NULL,'Rotterdam','Tianjin',
   'shipped',NULL,'2025-10','2025-Q4'),

  ('AIAG-2025-012','CT-2025-012',u_shanghai,   u_lactalis, 'A4','Lactalis','Demineralised Whey 90%',
   3.6800,14.00,'MT','2025-11-05','2025-11-11',NULL,'2025-12-18',
   'LAC-251101','2025-10-20','DF-INV-012',3.4500,
   'Geodis','LC-2025-012','Le Havre','Shanghai',
   'production',NULL,'2025-11','2025-Q4'),

  ('AIAG-2025-013','CT-2025-013',u_beijing,    u_fonterra, 'B4','Fonterra','Butter 82% Fat',
   6.9000,10.00,'MT','2025-12-08','2025-12-14',NULL,'2026-01-20',
   NULL,NULL,NULL,6.5500,
   'Panalpina',NULL,'Auckland','Qingdao',
   'production',NULL,'2025-12','2025-Q4'),

  ('AIAG-2026-001','CT-2026-001',u_guangzhou,  u_arla,     'C4','Arla','Whey Protein Concentrate 80%',
   5.2500,12.00,'MT','2026-01-15','2026-01-21',NULL,'2026-03-01',
   NULL,NULL,NULL,4.9800,
   'DB Schenker',NULL,'Rotterdam','Guangzhou',
   'pending',NULL,'2026-01','2026-Q1'),

  ('AIAG-2026-002','CT-2026-002',u_shenzhen,   u_lactalis, 'D3','Lactalis','Casein Micellar',
   9.1000,8.00,'MT','2026-02-10','2026-02-16',NULL,'2026-03-25',
   NULL,NULL,NULL,8.7500,
   'Kuehne+Nagel',NULL,'Le Havre','Shenzhen',
   'pending','Awaiting production confirmation','2026-02','2026-Q1');

-- Visibility for all inserted orders
INSERT INTO order_visibility (container_number, role)
SELECT o.container_number, r.role
FROM orders o
CROSS JOIN (VALUES ('staff'), ('customer'), ('supplier')) AS r(role)
WHERE o.container_number LIKE 'AIAG-%'
ON CONFLICT DO NOTHING;

END $$;
