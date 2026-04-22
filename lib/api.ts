import { Product, ProductSummary, RankedProduct, Insights, SimilarProduct, ProductCategory } from './types'

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new Error('Unauthorized. Please log in.')
  }

  return res
}

export async function searchProducts(query: string): Promise<Product[]> {
  const res = await apiFetch(`/api/proxy/api/products/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error(`Search failed: ${res.statusText}`)
  return res.json()
}

export async function getProductSummary(id: string | number): Promise<ProductSummary> {
  const res = await apiFetch(`/api/proxy/api/products/${id}/summary`)
  if (!res.ok) throw new Error(`Failed to fetch summary: ${res.statusText}`)
  return res.json()
}

export async function getRankedProducts(categoryId?: number): Promise<RankedProduct[]> {
  const params = new URLSearchParams()
  if (categoryId) params.set('category_id', String(categoryId))
  const res = await apiFetch(`/api/proxy/api/products/ranking?${params.toString()}`)
  if (!res.ok) throw new Error(`Ranking failed: ${res.statusText}`)
  const data = await res.json()
  return data.ranked_products ?? []
}

export async function getCategories(): Promise<ProductCategory[]> {
  const res = await apiFetch('/api/proxy/api/categories')
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.statusText}`)
  return res.json()
}

export async function getInsights(): Promise<Insights> {
  const res = await apiFetch('/api/proxy/api/insights')
  if (!res.ok) throw new Error(`Insights failed: ${res.statusText}`)
  return res.json()
}

export async function getSimilarProducts(id: string | number): Promise<SimilarProduct[]> {
  const res = await apiFetch(`/api/proxy/api/products/${id}/similar`)
  if (!res.ok) throw new Error(`Similar products failed: ${res.statusText}`)
  return res.json()
}
