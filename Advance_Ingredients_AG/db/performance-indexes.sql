CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_belonged_month ON orders(belonged_month);
CREATE INDEX IF NOT EXISTS idx_orders_belonged_quarter ON orders(belonged_quarter);
CREATE INDEX IF NOT EXISTS idx_order_visibility_role_container ON order_visibility(role, container_number);
