import Link from 'next/link'
import { getProductSummary, getSimilarProducts } from '@/lib/api'
import { ProductSummary, SimilarProduct } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

function SentimentBadge({ sentiment }: { sentiment: ProductSummary['sentiment'] }) {
  const map = {
    positive: 'bg-emerald-100 text-emerald-700',
    neutral: 'bg-gray-100 text-gray-600',
    negative: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${map[sentiment]}`}>
      {sentiment}
    </span>
  )
}

function StarDisplay({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <span className="text-yellow-500 font-medium">
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
      <span className="text-gray-600 text-sm ml-1">{rating.toFixed(1)}/5</span>
    </span>
  )
}

function SimilarCard({ product }: { product: SimilarProduct }) {
  return (
    <Link
      href={`/products/${product.product_id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-400 hover:shadow-sm transition-all"
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-sm font-semibold text-gray-800 leading-tight">{product.product_name}</h4>
        <span className="text-indigo-600 font-bold text-sm ml-2 whitespace-nowrap">
          ${product.unit_price.toFixed(2)}
        </span>
      </div>
      {product.product_details?.brand && (
        <p className="text-xs text-gray-500">{product.product_details.brand}</p>
      )}
      <p className="text-indigo-500 text-xs mt-2">View details →</p>
    </Link>
  )
}

async function ProductDetailContent({ id }: { id: string }) {
  let summary: ProductSummary | null = null
  let similar: SimilarProduct[] = []
  let summaryError: string | null = null
  let similarError: string | null = null

  try {
    summary = await getProductSummary(id)
  } catch (err) {
    summaryError = err instanceof Error ? err.message : 'Failed to load product summary.'
  }

  try {
    similar = await getSimilarProducts(id)
  } catch (err) {
    similarError = err instanceof Error ? err.message : 'Failed to load similar products.'
  }

  if (summaryError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
        {summaryError}
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <h1 className="text-2xl font-bold text-gray-900">{summary.product_name}</h1>
          <SentimentBadge sentiment={summary.sentiment} />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
          <StarDisplay rating={summary.avg_rating} />
          <span>{summary.total_reviews} review{summary.total_reviews !== 1 ? 's' : ''}</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-400">Product ID: {summary.product_id}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">AI Summary</h2>
          <p className="text-gray-700 text-sm leading-relaxed">{summary.summary}</p>
        </div>
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summary.pros && summary.pros.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-1.5">
              <span>✅</span> Pros
            </h3>
            <ul className="space-y-2">
              {summary.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>
        )}
        {summary.cons && summary.cons.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-1.5">
              <span>❌</span> Cons
            </h3>
            <ul className="space-y-2">
              {summary.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Similar Products */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Similar Products</h2>
        {similarError && (
          <p className="text-sm text-red-500">{similarError}</p>
        )}
        {!similarError && similar.length === 0 && (
          <p className="text-sm text-gray-400">No similar products found.</p>
        )}
        {similar.length > 0 && (
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

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div>
      <div className="mb-5">
        <Link href="/search" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          ← Back to Search
        </Link>
      </div>
      <ProductDetailContent id={id} />
    </div>
  )
}
