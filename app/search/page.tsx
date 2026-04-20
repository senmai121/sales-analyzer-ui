'use client'

import { useState } from 'react'
import Link from 'next/link'
import { searchProducts } from '@/lib/api'
import { Product } from '@/lib/types'

function StarRating({ reviews }: { reviews: { rating: number }[] }) {
  if (!reviews || reviews.length === 0) return <span className="text-gray-400 text-xs">No reviews</span>
  const avg = Math.min(5, Math.max(0, reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length))
  const full = Math.round(avg)
  return (
    <span className="text-sm font-medium">
      <span className="text-yellow-500">{'★'.repeat(full)}</span>
      <span className="text-gray-300">{'★'.repeat(5 - full)}</span>
      <span className="text-gray-500 ml-1">({reviews.length})</span>
    </span>
  )
}

function ProductCard({ product }: { product: Product }) {
  const { product_id, product_name, unit_price, product_details } = product
  return (
    <Link
      href={`/products/${product_id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-400 hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 text-base leading-tight">{product_name}</h3>
        <span className="text-indigo-600 font-bold text-lg ml-3 whitespace-nowrap">
          ${unit_price.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {product_details.brand && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {product_details.brand}
          </span>
        )}
        {product_details.colour && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {product_details.colour}
          </span>
        )}
        {product_details.gender && (
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full capitalize">
            {product_details.gender}
          </span>
        )}
      </div>
      {product_details.description && (
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product_details.description}</p>
      )}
      <StarRating reviews={product_details.reviews} />
      <p className="text-indigo-500 text-xs mt-2 font-medium">View AI Summary →</p>
    </Link>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await searchProducts(query.trim())
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Product Search</h1>
      <p className="text-gray-500 mb-6">
        Use natural language to find products — e.g. "blue jeans for women" or "warm winter coat".
      </p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {loading && <Spinner />}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!loading && searched && !error && results.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">Try a different search term.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
