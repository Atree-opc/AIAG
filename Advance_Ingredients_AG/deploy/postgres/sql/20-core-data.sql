-- Generated from backups/core-data bundle
-- Source: backups/core-data/latest/db.core.bundle.json
-- Created at: 2026-05-28T08:31:02.844Z
BEGIN;
SET client_min_messages TO WARNING;

-- users: 6 rows
INSERT INTO users (user_id, name, role, password_hash, company_name, address, city, country, created_at) VALUES ('13be817c-8f55-44f2-986e-0ecf13dbd888', 'accountant', 'accountant', '$2b$12$jB6FJwkBVtx6e3CF6vm41.6onzonazCczoILNxNxFzPHwprP9UNgG', NULL, NULL, NULL, NULL, '2026-05-14 06:28:19.385796+00');
INSERT INTO users (user_id, name, role, password_hash, company_name, address, city, country, created_at) VALUES ('5fb65753-062f-4e43-8c06-51f2721f86cc', 'admin', 'admin', '$2b$12$CSdSrals/6TAiN0kmBrYS.2m6to5Gc07zfqaDxTZObgGB5arPNboy', NULL, NULL, NULL, NULL, '2026-05-13 12:28:47.027879+00');
INSERT INTO users (user_id, name, role, password_hash, company_name, address, city, country, created_at) VALUES ('869743c3-3b07-4e8b-a483-407ad2c5595c', 'nongdu', 'customer', '$2b$12$Qt.sz2AblyhNuFsmIlq31uqo4YpU9/81V9JBAOwOjfWnSpmVR8XoC', NULL, NULL, NULL, NULL, '2026-05-14 01:37:50.257441+00');
INSERT INTO users (user_id, name, role, password_hash, company_name, address, city, country, created_at) VALUES ('45b53c14-1768-45ca-b3c2-3d337a1bd6d6', 'yifan', 'customer', '$2b$12$kR9.68yt3TGwDYZZn/SxZeBprWoACVLRJallD/xX/eJMT5WoXAs3.', NULL, NULL, NULL, NULL, '2026-05-14 01:37:44.637816+00');
INSERT INTO users (user_id, name, role, password_hash, company_name, address, city, country, created_at) VALUES ('243643f4-c88a-476d-a667-a0b502924b33', 'staff', 'staff', '$2b$12$NRJQc1e/idLgaS558l5fo.02ZbHxnrDhKVpiwbWCAMFsKJAw8GMqa', NULL, NULL, NULL, NULL, '2026-05-13 12:28:47.22636+00');
INSERT INTO users (user_id, name, role, password_hash, company_name, address, city, country, created_at) VALUES ('1352c4b2-47ad-4dc1-9b99-6882db9ea98f', 'dairyfood', 'supplier', '$2b$12$buB4Qz.f78zUVeTjWHxtZeLu0G22cKPsYTrzLZkV7I0GQv2PzHOR2', NULL, NULL, NULL, NULL, '2026-05-14 01:37:17.857386+00');

-- orders: 11 rows
INSERT INTO orders (container_number, contract_id, customer_id, supplier_id, bl, brand, product, price, quantity, quantity_unit, loading_date, etd, ship_on_board_date, eta, batch_no, production_date, df_invoice_no, df_ai_price, freight_forwarder, freight_forwarder_method, lc_number, port_of_loading, port_of_discharge, status, remarks, belonged_month, belonged_quarter, parity, packing, payment_terms, origin, shelf_life, invoice_no, lc_issue_date, lc_bank_name, lc_bank_bic, lc_bank_address, buyer_name, buyer_address, is_organic, tc_contract_no, tc_invoice_no, tc_seller, tc_buyer, created_at) VALUES ('C263-11', 'AC260301', '869743c3-3b07-4e8b-a483-407ad2c5595c', '1352c4b2-47ad-4dc1-9b99-6882db9ea98f', NULL, 'LVEO', 'WPCi80', '15.1000', '18.00', 'MT', NULL, '2026-03-28', '2026-03-30', '2026-04-30', 'WPC1802260154', '2026-02-17', 'DR262602', '13.9000', 'TCI', NULL, '571LC2600112', NULL, NULL, 'pending', 'FFAU2955049', '2026-03', '2026-Q1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, NULL, NULL, NULL, '2026-05-14 08:22:17.041583+00');
INSERT INTO orders (container_number, contract_id, customer_id, supplier_id, bl, brand, product, price, quantity, quantity_unit, loading_date, etd, ship_on_board_date, eta, batch_no, production_date, df_invoice_no, df_ai_price, freight_forwarder, freight_forwarder_method, lc_number, port_of_loading, port_of_discharge, status, remarks, belonged_month, belonged_quarter, parity, packing, payment_terms, origin, shelf_life, invoice_no, lc_issue_date, lc_bank_name, lc_bank_bic, lc_bank_address, buyer_name, buyer_address, is_organic, tc_contract_no, tc_invoice_no, tc_seller, tc_buyer, created_at) VALUES ('C263-12', 'AC260302', '869743c3-3b07-4e8b-a483-407ad2c5595c', '1352c4b2-47ad-4dc1-9b99-6882db9ea98f', NULL, 'LVEO', 'WPCi80', '15.1000', '18.00', 'MT', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '13.9000', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2026-03', '2026-Q1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, NULL, NULL, NULL, '2026-05-14 08:22:17.041583+00');
INSERT INTO orders (container_number, contract_id, customer_id, supplier_id, bl, brand, product, price, quantity, quantity_unit, loading_date, etd, ship_on_board_date, eta, batch_no, production_date, df_invoice_no, df_ai_price, freight_forwarder, freight_forwarder_method, lc_number, port_of_loading, port_of_discharge, status, remarks, belonged_month, belonged_quarter, parity, packing, payment_terms, origin, shelf_life, invoice_no, lc_issue_date, lc_bank_name, lc_bank_bic, lc_bank_address, buyer_name, buyer_address, is_organic, tc_contract_no, tc_invoice_no, tc_seller, tc_buyer, created_at) VALUES ('C263-13', 'AC260303', '45b53c14-1768-45ca-b3c2-3d337a1bd6d6', '1352c4b2-47ad-4dc1-9b99-6882db9ea98f', NULL, 'FOONEXUS', 'bio lactose', '3.3000', '25.00', 'MT', '2001-11-02', '2026-03-17', '2026-03-24', '2026-04-30', 'LAC1302260142', '2026-02-12', 'DR262547', '2.9000', 'TCI', NULL, 'LC1900326000286', NULL, NULL, 'pending', 'SEGU6551041', '2026-03', '2026-Q1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, NULL, NULL, NULL, '2026-05-14 08:22:17.041583+00');
INSERT INTO orders (container_number, contract_id, customer_id, supplier_id, bl, brand, product, price, quantity, quantity_unit, loading_date, etd, ship_on_board_date, eta, batch_no, production_date, df_invoice_no, df_ai_price, freight_forwarder, freight_forwarder_method, lc_number, port_of_loading, port_of_discharge, status, remarks, belonged_month, belonged_quarter, parity, packing, payment_terms, origin, shelf_life, invoice_no, lc_issue_date, lc_bank_name, lc_bank_bic, lc_bank_address, buyer_name, buyer_address, is_organic, tc_contract_no, tc_invoice_no, tc_seller, tc_buyer, created_at) VALUES ('C263-14', 'AC260401', NULL, NULL, NULL, 'LVEO', 'WPCi80', '16.6000', '18.00', 'MT', '2026-04-08', '2026-04-17', NULL, '2026-05-30', 'WPC2003260214', '2026-03-19', 'DR262693', '15.4000', NULL, NULL, NULL, NULL, NULL, 'pending', 'YMMU6355495', '2026-04', '2026-Q2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, NULL, NULL, NULL, '2026-05-14 06:37:30.09453+00');
INSERT INTO orders (container_number, contract_id, customer_id, supplier_id, bl, brand, product, price, quantity, quantity_unit, loading_date, etd, ship_on_board_date, eta, batch_no, production_date, df_invoice_no, df_ai_price, freight_forwarder, freight_forwarder_method, lc_number, port_of_loading, port_of_discharge, status, remarks, belonged_month, belonged_quarter, parity, packing, payment_terms, origin, shelf_life, invoice_no, lc_issue_date, lc_bank_name, lc_bank_bic, lc_bank_address, buyer_name, buyer_address, is_organic, tc_contract_no, tc_invoice_no, tc_seller, tc_buyer, created_at) VALUES ('C263-15', 'AC260402', NULL, NULL, NULL, 'LVEO', 'WPCi80', '16.6000', '18.00', 'MT', '2026-04-20', '2026-04-26', NULL, '2026-06-20', 'WPC0804260246', '2026-04-07', 'DR262760', '15.4000', NULL, NULL, NULL, NULL, NULL, 'pending', 'YMMU6359103', '2026-04', '2026-Q2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, NULL, NULL, NULL, '2026-05-14 06:37:30.09453+00');
INSERT INTO orders (container_number, contract_id, customer_id, supplier_id, bl, brand, product, price, quantity, quantity_unit, loading_date, etd, ship_on_board_date, eta, batch_no, production_date, df_invoice_no, df_ai_price, freight_forwarder, freight_forwarder_method, lc_number, port_of_loading, port_of_discharge, status, remarks, belonged_month, belonged_quarter, parity, packing, payment_terms, origin, shelf_life, invoice_no, lc_issue_date, lc_bank_name, lc_bank_bic, lc_bank_address, buyer_name, buyer_address, is_organic, tc_contract_no, tc_invoice_no, tc_seller, tc_buyer, created_at) VALUES ('C263-16', 'AC260403', NULL, NULL, NULL, 'LVEO', 'WPCi80', '16.6000', '18.00', 'MT', '2026-04-29', '2026-07-02', NULL, '2026-07-02', 'WPC1404260264', '2026-04-13', 'DR262830', '15.4000', NULL, NULL, NULL, NULL, NULL, 'pending', 'MAGU5657374', '2026-04', '2026-Q2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, NULL, NULL, NULL, '2026-05-14 06:37:30.09453+00');
INSERT INTO orders (container_number, contract_id, customer_id, supplier_id, bl, brand, product, price, quantity, quantity_unit, loading_date, etd, ship_on_board_date, eta, batch_no, production_date, df_invoice_no, df_ai_price, freight_forwarder, freight_forwarder_method, lc_number, port_of_loading, port_of_discharge, status, remarks, belonged_month, belonged_quarter, parity, packing, payment_terms, origin, shelf_life, invoice_no, lc_issue_date, lc_bank_name, lc_bank_bic, lc_bank_address, buyer_name, buyer_address, is_organic, tc_contract_no, tc_invoice_no, tc_seller, tc_buyer, created_at) VALUES ('C263-17', 'AC260404', NULL, NULL, NULL, 'FOONEXUS', 'bio lactose', '3.3000', '25.00', 'MT', '2026-04-15', '2026-04-23', NULL, '2026-06-06', 'LAC2503260229', '2026-03-24', 'DR262737', '2.4000', NULL, NULL, NULL, NULL, NULL, 'pending', 'OCGU8013217', '2026-04', '2026-Q2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, NULL, NULL, NULL, '2026-05-14 06:37:30.09453+00');
INSERT INTO orders (container_number, contract_id, customer_id, supplier_id, bl, brand, product, price, quantity, quantity_unit, loading_date, etd, ship_on_board_date, eta, batch_no, production_date, df_invoice_no, df_ai_price, freight_forwarder, freight_forwarder_method, lc_number, port_of_loading, port_of_discharge, status, remarks, belonged_month, belonged_quarter, parity, packing, payment_terms, origin, shelf_life, invoice_no, lc_issue_date, lc_bank_name, lc_bank_bic, lc_bank_address, buyer_name, buyer_address, is_organic, tc_contract_no, tc_invoice_no, tc_seller, tc_buyer, created_at) VALUES ('C263-18', 'AC260501', NULL, NULL, NULL, 'LVEO', 'WPCi80', '17.7500', '18.00', 'MT', '1969-12-31', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2026-05', '2026-Q2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, NULL, NULL, NULL, '2026-05-14 03:16:27.101506+00');
INSERT INTO orders (container_number, contract_id, customer_id, supplier_id, bl, brand, product, price, quantity, quantity_unit, loading_date, etd, ship_on_board_date, eta, batch_no, production_date, df_invoice_no, df_ai_price, freight_forwarder, freight_forwarder_method, lc_number, port_of_loading, port_of_discharge, status, remarks, belonged_month, belonged_quarter, parity, packing, payment_terms, origin, shelf_life, invoice_no, lc_issue_date, lc_bank_name, lc_bank_bic, lc_bank_address, buyer_name, buyer_address, is_organic, tc_contract_no, tc_invoice_no, tc_seller, tc_buyer, created_at) VALUES ('C263-19', 'AC260502', NULL, NULL, NULL, 'LVEO', 'WPCi80', '17.7500', '18.00', 'MT', '1970-01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2026-05', '2026-Q2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, NULL, NULL, NULL, '2026-05-14 03:16:27.101506+00');
INSERT INTO orders (container_number, contract_id, customer_id, supplier_id, bl, brand, product, price, quantity, quantity_unit, loading_date, etd, ship_on_board_date, eta, batch_no, production_date, df_invoice_no, df_ai_price, freight_forwarder, freight_forwarder_method, lc_number, port_of_loading, port_of_discharge, status, remarks, belonged_month, belonged_quarter, parity, packing, payment_terms, origin, shelf_life, invoice_no, lc_issue_date, lc_bank_name, lc_bank_bic, lc_bank_address, buyer_name, buyer_address, is_organic, tc_contract_no, tc_invoice_no, tc_seller, tc_buyer, created_at) VALUES ('C263-20', 'AC260503', NULL, NULL, NULL, 'LVEO', 'WPCi80', '17.7500', '18.00', 'MT', '1970-01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2026-05', '2026-Q2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, NULL, NULL, NULL, '2026-05-14 03:16:27.101506+00');
INSERT INTO orders (container_number, contract_id, customer_id, supplier_id, bl, brand, product, price, quantity, quantity_unit, loading_date, etd, ship_on_board_date, eta, batch_no, production_date, df_invoice_no, df_ai_price, freight_forwarder, freight_forwarder_method, lc_number, port_of_loading, port_of_discharge, status, remarks, belonged_month, belonged_quarter, parity, packing, payment_terms, origin, shelf_life, invoice_no, lc_issue_date, lc_bank_name, lc_bank_bic, lc_bank_address, buyer_name, buyer_address, is_organic, tc_contract_no, tc_invoice_no, tc_seller, tc_buyer, created_at) VALUES ('C263-21', 'AC260504', NULL, NULL, NULL, 'FOONEXUS', 'bio lactose', '3.3000', '25.00', 'MT', '1970-01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, '2026-05', '2026-Q2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL, NULL, NULL, NULL, '2026-05-14 03:16:27.101506+00');

-- order_visibility: 33 rows
INSERT INTO order_visibility (container_number, role) VALUES ('C263-11', 'customer');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-11', 'staff');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-11', 'supplier');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-12', 'customer');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-12', 'staff');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-12', 'supplier');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-13', 'customer');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-13', 'staff');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-13', 'supplier');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-14', 'customer');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-14', 'staff');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-14', 'supplier');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-15', 'customer');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-15', 'staff');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-15', 'supplier');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-16', 'customer');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-16', 'staff');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-16', 'supplier');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-17', 'customer');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-17', 'staff');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-17', 'supplier');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-18', 'customer');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-18', 'staff');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-18', 'supplier');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-19', 'customer');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-19', 'staff');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-19', 'supplier');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-20', 'customer');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-20', 'staff');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-20', 'supplier');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-21', 'customer');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-21', 'staff');
INSERT INTO order_visibility (container_number, role) VALUES ('C263-21', 'supplier');

-- order_files: 10 rows
INSERT INTO order_files (file_id, container_number, filename, stored_name, file_size, mime_type, uploaded_by, uploaded_at, visible_to_customer, visible_to_supplier, visible_to_accountant) VALUES ('98a52da0-06c3-4dfa-8e2a-62a8036cea7e', 'C263-11', 'C263-11-571LC2600112.pdf', '9832c86e-beea-4fc8-a499-e2dd4926ac21.pdf', '73666', 'application/pdf', '243643f4-c88a-476d-a667-a0b502924b33', '2026-05-14 09:18:35.308918+00', FALSE, TRUE, FALSE);
INSERT INTO order_files (file_id, container_number, filename, stored_name, file_size, mime_type, uploaded_by, uploaded_at, visible_to_customer, visible_to_supplier, visible_to_accountant) VALUES ('7cb8ec3a-0b2b-4fbe-a174-01f72aa9ad8b', 'C263-11', 'C263-11-invoice AI260304-WPCi80-AC260301.pdf', '0efe31be-2254-4f44-9840-82193553ff0c.pdf', '250437', 'application/pdf', '243643f4-c88a-476d-a667-a0b502924b33', '2026-05-14 09:18:37.154806+00', FALSE, TRUE, FALSE);
INSERT INTO order_files (file_id, container_number, filename, stored_name, file_size, mime_type, uploaded_by, uploaded_at, visible_to_customer, visible_to_supplier, visible_to_accountant) VALUES ('335333e0-1621-4298-8bfd-2addeef2bee3', 'C263-11', 'C263-11-IPPC.pdf', '77b32cef-7a14-459c-9865-28b9dc17d99d.pdf', '213880', 'application/pdf', '243643f4-c88a-476d-a667-a0b502924b33', '2026-05-14 09:18:38.774679+00', FALSE, TRUE, FALSE);
INSERT INTO order_files (file_id, container_number, filename, stored_name, file_size, mime_type, uploaded_by, uploaded_at, visible_to_customer, visible_to_supplier, visible_to_accountant) VALUES ('9a974bfd-cb07-4ef2-8e78-0b3df8657500', 'C263-11', 'C263-11-WPCi80-AC260301.pdf', 'ddb1056b-3311-457f-be0c-ee2b5c663eb7.pdf', '241952', 'application/pdf', '243643f4-c88a-476d-a667-a0b502924b33', '2026-05-14 09:18:41.437315+00', TRUE, FALSE, FALSE);
INSERT INTO order_files (file_id, container_number, filename, stored_name, file_size, mime_type, uploaded_by, uploaded_at, visible_to_customer, visible_to_supplier, visible_to_accountant) VALUES ('1ac90691-510d-4a72-829b-f5c9b1ddcdf0', 'C263-11', 'Original  LC BW011AE2600018.pdf', 'b1f92f35-5062-4454-803d-c48237610cdf.pdf', '422814', 'application/pdf', '243643f4-c88a-476d-a667-a0b502924b33', '2026-05-14 09:18:57.559846+00', FALSE, TRUE, FALSE);
INSERT INTO order_files (file_id, container_number, filename, stored_name, file_size, mime_type, uploaded_by, uploaded_at, visible_to_customer, visible_to_supplier, visible_to_accountant) VALUES ('9a19f100-74c4-4b71-bdc3-083b23a0bbf3', 'C263-13', 'C263-13-bio lactose-AC260303.pdf', 'bf61574f-68d5-4e67-8b98-25ca06e78367.pdf', '249585', 'application/pdf', '243643f4-c88a-476d-a667-a0b502924b33', '2026-05-14 09:22:13.330891+00', TRUE, FALSE, FALSE);
INSERT INTO order_files (file_id, container_number, filename, stored_name, file_size, mime_type, uploaded_by, uploaded_at, visible_to_customer, visible_to_supplier, visible_to_accountant) VALUES ('894b7b75-6f29-485b-bfe4-9dae017863c5', 'C263-13', 'C263-13-invoice AI260303-bio lactose-AC260303.pdf', '52933578-f2e8-4748-9eb9-dc6ad53b7e2f.pdf', '264351', 'application/pdf', '243643f4-c88a-476d-a667-a0b502924b33', '2026-05-14 09:22:14.664341+00', FALSE, TRUE, FALSE);
INSERT INTO order_files (file_id, container_number, filename, stored_name, file_size, mime_type, uploaded_by, uploaded_at, visible_to_customer, visible_to_supplier, visible_to_accountant) VALUES ('5a958ffe-b4e2-40a5-b1b6-0b14ca788781', 'C263-13', 'C263-13-IPPC.pdf', 'f081f35f-9252-421d-99fa-aafa7cb3b57b.pdf', '219812', 'application/pdf', '243643f4-c88a-476d-a667-a0b502924b33', '2026-05-14 09:22:20.076875+00', FALSE, TRUE, FALSE);
INSERT INTO order_files (file_id, container_number, filename, stored_name, file_size, mime_type, uploaded_by, uploaded_at, visible_to_customer, visible_to_supplier, visible_to_accountant) VALUES ('088d1255-d28a-47a0-9e9d-1fafb9197613', 'C263-13', 'LC1900326000286.pdf', 'ff7e3fd0-141e-40b9-86d2-b2d65925249e.pdf', '79867', 'application/pdf', '243643f4-c88a-476d-a667-a0b502924b33', '2026-05-14 09:22:21.57698+00', FALSE, TRUE, FALSE);
INSERT INTO order_files (file_id, container_number, filename, stored_name, file_size, mime_type, uploaded_by, uploaded_at, visible_to_customer, visible_to_supplier, visible_to_accountant) VALUES ('c742cb57-f306-442f-96f8-adf6a05f3ec5', 'C263-13', 'Scan C263-13 LAC1302260142.pdf', 'd8d4a916-92a3-47dc-ad16-1eabf60bd79c.pdf', '1878159', 'application/pdf', '243643f4-c88a-476d-a667-a0b502924b33', '2026-05-14 09:22:29.395648+00', TRUE, FALSE, FALSE);

-- role_field_visibility: 92 rows
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'brand', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'buyer_address', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'buyer_name', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'container_number', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'contract_id', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'invoice_no', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'lc_bank_address', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'lc_bank_bic', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'lc_bank_name', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'lc_issue_date', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'lc_number', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'parity', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'payment_terms', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'price', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'product', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'quantity', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('accountant', 'status', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('customer', 'batch_no', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('customer', 'brand', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('customer', 'container_number', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('customer', 'contract_id', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('customer', 'eta', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('customer', 'etd', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('customer', 'loading_date', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('customer', 'product', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('customer', 'quantity', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('customer', 'remarks', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('customer', 'ship_on_board_date', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('customer', 'status', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'batch_no', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'belonged_month', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'belonged_quarter', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'bl', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'brand', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'buyer_address', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'buyer_name', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'container_number', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'contract_id', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'customer_id', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'df_ai_price', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'df_invoice_no', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'eta', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'etd', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'freight_forwarder', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'freight_forwarder_method', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'invoice_no', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'is_organic', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'lc_bank_address', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'lc_bank_bic', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'lc_bank_name', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'lc_issue_date', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'lc_number', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'loading_date', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'origin', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'packing', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'parity', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'payment_terms', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'port_of_discharge', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'port_of_loading', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'price', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'product', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'production_date', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'quantity', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'quantity_unit', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'remarks', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'shelf_life', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'ship_on_board_date', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'status', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'supplier_id', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'tc_buyer', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'tc_contract_no', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'tc_invoice_no', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('staff', 'tc_seller', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'batch_no', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'brand', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'container_number', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'contract_id', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'df_ai_price', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'df_invoice_no', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'eta', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'etd', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'freight_forwarder', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'lc_number', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'loading_date', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'port_of_discharge', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'port_of_loading', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'product', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'production_date', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'quantity', FALSE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'remarks', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'ship_on_board_date', TRUE);
INSERT INTO role_field_visibility (role, field_key, editable) VALUES ('supplier', 'status', TRUE);

-- hard_denied_info: 0 rows
-- hard_denied_info has no seed rows

-- order_options: 6 rows
INSERT INTO order_options (option_id, option_type, value, sort_order, created_at) VALUES ('0b4a7841-6053-4289-ae6f-93fe679361a8', 'parity', 'CIF Tianjin, Xingang,China (Incoterms 2020)', 1, '2026-05-13 12:21:29.031115+00');
INSERT INTO order_options (option_id, option_type, value, sort_order, created_at) VALUES ('a730e2ff-4ccd-41f9-afb2-9ed73983c454', 'parity', 'DAP Beijing, China (Incoterms 2020)', 2, '2026-05-13 12:21:29.031115+00');
INSERT INTO order_options (option_id, option_type, value, sort_order, created_at) VALUES ('44a77f72-64f2-423c-9677-2178095bc88e', 'parity', 'DAP Shanghai, China (Incoterms 2020)', 3, '2026-05-13 12:21:29.031115+00');
INSERT INTO order_options (option_id, option_type, value, sort_order, created_at) VALUES ('dee68d4b-6f47-4088-9391-6e6fcb855c13', 'payment_terms', 'L/C 90 days after B/L date', 1, '2026-05-13 12:21:29.031115+00');
INSERT INTO order_options (option_id, option_type, value, sort_order, created_at) VALUES ('16cf101b-a4eb-4824-abe3-e48d8fab6072', 'payment_terms', 'T/T 100% payment 30 days after shipment', 2, '2026-05-13 12:21:29.031115+00');
INSERT INTO order_options (option_id, option_type, value, sort_order, created_at) VALUES ('634aef37-3db1-48dc-be56-0120481b5447', 'payment_terms', 'T/T 100% payment 60 days after shipment', 3, '2026-05-13 12:21:29.031115+00');

-- accountant_files: 0 rows
-- accountant_files has no seed rows

-- order_month: 0 rows
-- order_month has no seed rows

-- order_quarter: 0 rows
-- order_quarter has no seed rows

COMMIT;
