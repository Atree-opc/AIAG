export type Role = 'admin' | 'staff' | 'supplier' | 'customer' | 'accountant'

export interface JWTPayload {
  userId: string
  role: Role
  name: string
}

export interface User {
  user_id: string
  name: string
  role: Role
  company_name: string | null
  address: string | null
  city: string | null
  country: string | null
  created_at: string
}

export interface Order {
  container_number: string
  contract_id: string | null
  customer_id: string | null
  supplier_id: string | null
  bl: string | null
  brand: string | null
  product: string | null
  price: number | null
  quantity: number | null
  quantity_unit: string
  loading_date: string | null
  etd: string | null
  ship_on_board_date: string | null
  eta: string | null
  batch_no: string | null
  production_date: string | null
  df_invoice_no: string | null
  df_ai_price: number | null
  freight_forwarder: string | null
  freight_forwarder_method: string | null
  lc_number: string | null
  port_of_loading: string | null
  port_of_discharge: string | null
  status: string
  remarks: string | null
  belonged_month: string | null
  belonged_quarter: string | null
  // Invoice / document fields
  parity: string | null
  packing: string | null
  payment_terms: string | null
  origin: string | null
  shelf_life: string | null
  invoice_no: string | null
  lc_issue_date: string | null
  lc_bank_name: string | null
  lc_bank_bic: string | null
  lc_bank_address: string | null
  // Buyer info (per-order, for contract generation)
  buyer_name: string | null
  buyer_address: string | null
  // Organic product fields
  is_organic: boolean
  tc_contract_no: string | null
  tc_invoice_no: string | null
  tc_seller: string | null
  tc_buyer: string | null
  created_at: string
}

export interface OrderOption {
  option_id: string
  option_type: string
  value: string
  sort_order: number
}

export const ROLE_REDIRECT: Record<Role, string> = {
  admin:      '/portal/admin/orders',
  staff:      '/portal/staff/orders',
  supplier:   '/portal/supplier/orders',
  customer:   '/portal/customer/orders',
  accountant: '/portal/accountant/orders',
}

export interface OrderFile {
  file_id:              string
  container_number:     string
  filename:             string
  stored_name:          string
  file_size:            number | null
  mime_type:            string | null
  uploaded_by:          string | null
  uploaded_at:          string
  visible_to_customer:   boolean
  visible_to_supplier:   boolean
  visible_to_accountant: boolean
}

export interface AccountantFile {
  file_id:         string
  year:            number
  month:           number
  filename:        string
  stored_name:     string
  file_size:       number | null
  mime_type:       string | null
  uploaded_by:     string | null
  uploaded_at:     string
  uploaded_by_name?: string
}

export interface OrderMonth {
  container_number: string
  year:             number
  month:            number
  updated_by:       string | null
  updated_at:       string
}

export interface OrderQuarter {
  container_number: string
  year:             number
  quarter:          number
  updated_by:       string | null
  updated_at:       string
}
