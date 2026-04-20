import { Product, ProductSummary, RankedProduct, Insights, SimilarProduct, ProductCategory } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function searchProducts(query: string): Promise<Product[]> {
  const res = await fetch(`${API_URL}/api/products/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error(`Search failed: ${res.statusText}`)
  return res.json()
}

export async function getProductSummary(id: string | number): Promise<ProductSummary> {
  const res = await fetch(`${API_URL}/api/products/${id}/summary`)
  if (!res.ok) throw new Error(`Failed to fetch summary: ${res.statusText}`)
  return res.json()
}

export async function getRankedProducts(categoryId?: number): Promise<RankedProduct[]> {
  const params = new URLSearchParams()
  if (categoryId) params.set('category_id', String(categoryId))
  const res = await fetch(`${API_URL}/api/products/ranking?${params.toString()}`)
  if (!res.ok) throw new Error(`Ranking failed: ${res.statusText}`)
  const data = await res.json()
  return data.ranked_products ?? []
}

export async function getCategories(): Promise<ProductCategory[]> {
  const res = await fetch(`${API_URL}/api/categories`)
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.statusText}`)
  return res.json()
}

export async function getInsights(): Promise<Insights> {
  const res = await fetch(`${API_URL}/api/insights`)
  if (!res.ok) throw new Error(`Insights failed: ${res.statusText}`)
  return res.json()
}

export async function getSimilarProducts(id: string | number): Promise<SimilarProduct[]> {
  const res = await fetch(`${API_URL}/api/products/${id}/similar`)
  if (!res.ok) throw new Error(`Similar products failed: ${res.statusText}`)
  return res.json()
}
