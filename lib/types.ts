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
