'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ProductSummary, SimilarProduct } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'
import { useSSE } from '@/lib/useSSE'
import { SSELoader } from '@/components/SSELoader'

function SentimentBadge({ sentiment }: { sentiment: ProductSummary['sentiment'] }) {
  const map = {
    positive: 'bg-mint/10 text-mint border-mint/20',
    neutral:  'bg-white/[0.06] text-ink-2 border-white/[0.08]',
    negative: 'bg-coral/10 text-coral border-coral/20',
  }
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${map[sentiment]}`}>
      {sentiment}
    </span>
  )
}

function StarDisplay({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <span className="font-medium">
      <span className="text-gold">{'★'.repeat(full)}</span>
      <span className="text-ink-3">{'★'.repeat(5 - full)}</span>
      <span className="text-ink-2 text-sm ml-1.5">{rating.toFixed(1)}/5</span>
    </span>
  )
}

function SimilarCard({ product }: { product: SimilarProduct }) {
  return (
    <Link
      href={`/products/${product.product_id}`}
      className="block bg-card rounded-xl border border-white/[0.07] p-4 hover:border-mint/20 hover:-translate-y-0.5 transition-all"
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-sm font-semibold text-ink leading-snug flex-1 mr-2">{product.product_name}</h4>
        <span className="text-mint font-bold text-sm shrink-0">${product.unit_price.toFixed(2)}</span>
      </div>
      {product.product_details?.brand && (
        <p className="text-xs text-ink-2">{product.product_details.brand}</p>
      )}
      <p className="text-azure text-xs mt-2 font-semibold">View details →</p>
    </Link>
  )
}

function ProductDetailContent({ id }: { id: string }) {
  const summarySSE = useSSE<ProductSummary>()
  const similarSSE = useSSE<SimilarProduct[]>()

  useEffect(() => {
    summarySSE.start(`/api/proxy/api/products/${id}/summary/stream`)
    similarSSE.start(`/api/proxy/api/products/${id}/similar/stream`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const summary = summarySSE.data
  const similar = similarSSE.data ?? []

  return (
    <div className="space-y-5">
      {summarySSE.loading ? (
        <SSELoader message={summarySSE.progress} />
      ) : summarySSE.error ? (
        <div className="rounded-xl border border-coral/20 bg-coral/5 px-4 py-3 text-sm text-coral">
          {summarySSE.error}
        </div>
      ) : summary ? (
        <>
          <div className="animate-fade-up bg-card rounded-xl border border-white/[0.07] p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <h1 className="font-heading text-2xl font-bold text-ink">{summary.product_name}</h1>
              <SentimentBadge sentiment={summary.sentiment} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-ink-2 mb-5">
              <StarDisplay rating={summary.avg_rating} />
              <span className="text-ink-3">·</span>
              <span>{summary.total_reviews} review{summary.total_reviews !== 1 ? 's' : ''}</span>
              <span className="text-ink-3">·</span>
              <span className="text-xs text-ink-3">ID #{summary.product_id}</span>
            </div>
            <div className="bg-canvas rounded-lg p-4 border border-white/[0.06]">
              <h2 className="text-[10px] font-bold text-mint uppercase tracking-widest mb-2">AI Summary</h2>
              <p className="text-ink-2 text-sm leading-relaxed">{summary.summary}</p>
            </div>
          </div>

          <div className="animate-fade-up-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.pros && summary.pros.length > 0 && (
              <div className="rounded-xl border border-mint/20 bg-mint/5 p-5">
                <h3 className="text-sm font-bold text-mint mb-3 flex items-center gap-1.5">
                  <span>✓</span> Pros
                </h3>
                <ul className="space-y-2">
                  {summary.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-mint shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {summary.cons && summary.cons.length > 0 && (
              <div className="rounded-xl border border-coral/20 bg-coral/5 p-5">
                <h3 className="text-sm font-bold text-coral mb-3 flex items-center gap-1.5">
                  <span>✕</span> Cons
                </h3>
                <ul className="space-y-2">
                  {summary.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-coral shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      ) : null}

      <div className="animate-fade-up-2">
        <h2 className="font-heading text-base font-semibold text-ink mb-3">Similar Products</h2>
        {similarSSE.loading ? (
          <SSELoader message={similarSSE.progress} />
        ) : similarSSE.error ? (
          <p className="text-sm text-coral">{similarSSE.error}</p>
        ) : similar.length === 0 ? (
          <p className="text-sm text-ink-3">No similar products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {similar.map((p) => (
              <SimilarCard key={p.product_id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <AuthGuard>
      <div>
        <div className="mb-5">
          <Link
            href="/search"
            className="text-xs font-semibold text-ink-2 hover:text-mint uppercase tracking-widest transition-colors"
          >
            ← Back to Search
          </Link>
        </div>
        <ProductDetailContent id={id} />
      </div>
    </AuthGuard>
  )
}
