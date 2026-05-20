export interface ProductCategory {
  category_id: number
  category_name: string
}

export interface ProductDetails {
  colour: string
  brand: string
  description: string
  sizes: string[]
  reviews: { rating: number; review?: string }[]
}

export interface Product {
  product_id: number
  product_name: string
  unit_price: number
  product_details: ProductDetails
}

export interface ProductSummary {
  product_id: number
  product_name: string
  brand_name?: string
  avg_rating: number
  total_reviews: number
  summary: string
  pros: string[]
  cons: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
}

export interface RankedProduct {
  rank: number
  product_id: number
  product_name: string
  brand_name?: string
  score: number
  reason: string
}

export interface Insights {
  top_performing_brands: string[]
  underperforming_products: string[]
  category_gaps: string[]
  pricing_recommendations: string[]
  generated_at: string
}

export interface SimilarProduct {
  product_id: number
  product_name: string
  unit_price: number
  product_details: ProductDetails
}

export interface POSLocation {
  id: number
  name: string
  address: string
}

export interface POSStats {
  today_revenue: number
  today_orders: number
  avg_order_value: number
  pending_orders: number
  low_stock_count: number
}

export interface RevenueDataPoint {
  date: string
  revenue: number
  orders: number
}

export interface TopProduct {
  product_id: number
  product_name: string
  brand_name?: string
  total_qty: number
  total_revenue: number
}

export interface PaymentMethodStat {
  method: string
  total: number
  count: number
}

export interface InventoryItem {
  product_id: number
  product_name: string
  brand_name?: string
  size: string
  quantity: number
  store_name: string
}

export interface POSOrder {
  id: number
  status: string
  total_amount: number
  store_id: number
  store_name: string
  customer_name: string
  created_at: string
  items_count: number
}

export interface POSOrderDetailItem {
  product_id: number
  product_name: string
  brand_name?: string
  size?: string
  quantity: number
  unit_price: number
  total_amount: number
}

export interface POSPaymentRecord {
  method: string
  amount: number
  reference?: string
}

export interface POSOrderDetail {
  order_id: number
  status: string
  store_name: string
  customer_name: string
  subtotal: number
  vat_amount: number
  total_amount: number
  created_at: string
  items: POSOrderDetailItem[]
  payments: POSPaymentRecord[]
}
