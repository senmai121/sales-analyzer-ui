'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Product } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'
import { useSSE } from '@/lib/useSSE'
import { SSELoader } from '@/components/SSELoader'

function StarRating({ reviews }: { reviews: { rating: number }[] }) {
  if (!reviews || reviews.length === 0)
    return <span className="text-ink-3 text-xs">No reviews</span>
  const rawAvg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  const avg = Math.min(5, Math.max(0, rawAvg / 2))
  const full = Math.round(avg)
  return (
    <span className="text-sm">
      <span className="text-gold">{'★'.repeat(full)}</span>
      <span className="text-ink-3">{'★'.repeat(5 - full)}</span>
      <span className="text-ink-3 ml-1 text-xs">({rawAvg.toFixed(1)}/10, {reviews.length} reviews)</span>
    </span>
  )
}

function ProductCard({ product }: { product: Product }) {
  const { product_id, product_name, unit_price, product_details } = product
  return (
    <Link
      href={`/products/${product_id}`}
      className="group block bg-card rounded-xl border border-white/[0.07] p-5 hover:border-mint/20 hover:-translate-y-0.5 transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-ink text-sm leading-snug flex-1 mr-2">{product_name}</h3>
        <span className="text-mint font-bold text-base shrink-0">${unit_price.toFixed(2)}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {product_details.brand && (
          <span className="text-xs bg-white/[0.04] text-ink-2 px-2 py-0.5 rounded-full border border-white/[0.06]">
            {product_details.brand}
          </span>
        )}
        {product_details.colour && (
          <span className="text-xs bg-white/[0.04] text-ink-2 px-2 py-0.5 rounded-full border border-white/[0.06]">
            {product_details.colour}
          </span>
        )}
      </div>
      {product_details.description && (
        <p className="text-ink-2 text-xs mb-3 line-clamp-2 leading-relaxed">{product_details.description}</p>
      )}
      <StarRating reviews={product_details.reviews} />
      <p className="text-azure text-xs mt-2.5 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
        View AI Summary →
      </p>
    </Link>
  )
}

function SearchContent() {
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)
  const sse = useSSE<Product[]>()

  function handleSearch(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!query.trim()) return
    setSearched(true)
    sse.start(`/api/proxy/api/products/search/stream?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div>
      <div className="mb-8 animate-fade-up">
        <h1 className="font-heading text-3xl font-bold text-ink mb-1">Smart Search</h1>
        <p className="text-ink-2 text-sm">Natural language search across your entire product catalog.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8 animate-fade-up-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "blue jeans for women" or "warm winter coat"'
          className="flex-1 bg-card border border-white/[0.08] rounded-xl px-5 py-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-mint/30 focus:ring-1 focus:ring-mint/10 transition-all"
        />
        <button
          type="submit"
          disabled={sse.loading || !query.trim()}
          className="bg-mint text-canvas px-6 py-3 rounded-xl text-sm font-bold hover:bg-mint-dim disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
        >
          {sse.loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {sse.loading && <SSELoader message={sse.progress} />}

      {sse.error && (
        <div className="rounded-xl border border-coral/20 bg-coral/5 px-4 py-3 text-sm text-coral">
          {sse.error}
        </div>
      )}

      {!sse.loading && searched && !sse.error && (!sse.data || sse.data.length === 0) && (
        <div className="text-center py-20">
          <p className="text-5xl mb-3 opacity-20">⌕</p>
          <p className="font-semibold text-ink-2">No products found</p>
          <p className="text-sm text-ink-3 mt-1">Try a different search term.</p>
        </div>
      )}

      {!sse.loading && sse.data && sse.data.length > 0 && (
        <div>
          <p className="text-xs text-ink-3 font-semibold uppercase tracking-widest mb-4">
            {sse.data.length} result{sse.data.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sse.data.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <AuthGuard>
      <SearchContent />
    </AuthGuard>
  )
}
