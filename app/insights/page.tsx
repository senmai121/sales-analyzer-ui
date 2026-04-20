'use client'

import { useState } from 'react'
import { getInsights } from '@/lib/api'
import { Insights } from '@/lib/types'

function InsightSection({
  title,
  icon,
  items,
  color,
}: {
  title: string
  icon: string
  items: string[]
  color: string
}) {
  const bgMap: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-200',
    red: 'bg-red-50 border-red-200',
    blue: 'bg-blue-50 border-blue-200',
    amber: 'bg-amber-50 border-amber-200',
  }
  const titleMap: Record<string, string> = {
    emerald: 'text-emerald-800',
    red: 'text-red-800',
    blue: 'text-blue-800',
    amber: 'text-amber-800',
  }
  const dotMap: Record<string, string> = {
    emerald: 'bg-emerald-400',
    red: 'bg-red-400',
    blue: 'bg-blue-400',
    amber: 'bg-amber-400',
  }

  if (!items || items.length === 0) return null

  return (
    <div className={`rounded-xl border p-5 ${bgMap[color]}`}>
      <h3 className={`font-semibold text-base mb-3 flex items-center gap-2 ${titleMap[color]}`}>
        <span>{icon}</span>
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${dotMap[color]}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFetch() {
    setLoading(true)
    setError(null)
    try {
      const data = await getInsights()
      setInsights(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Insights</h1>
      <p className="text-gray-500 mb-6">
        Get an AI-powered analysis of your entire product catalog — top brands, weak spots, gaps, and pricing strategy.
      </p>

      {!insights && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-lg font-medium text-gray-700 mb-2">Ready to analyze your catalog?</p>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Click the button below to generate AI-powered insights across your entire product catalog.
            This may take a moment.
          </p>
          <button
            onClick={handleFetch}
            disabled={loading}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            Generate Insights
          </button>
        </div>
      )}

      {loading && <Spinner />}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
          <button
            onClick={handleFetch}
            className="ml-3 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {insights && !loading && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-400">
              Generated at: {new Date(insights.generated_at).toLocaleString()}
            </p>
            <button
              onClick={handleFetch}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium underline"
            >
              Regenerate
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InsightSection
              title="Top Performing Brands"
              icon="🌟"
              items={insights.top_performing_brands}
              color="emerald"
            />
            <InsightSection
              title="Underperforming Products"
              icon="⚠️"
              items={insights.underperforming_products}
              color="red"
            />
            <InsightSection
              title="Category Gaps"
              icon="🔎"
              items={insights.category_gaps}
              color="blue"
            />
            <InsightSection
              title="Pricing Recommendations"
              icon="💡"
              items={insights.pricing_recommendations}
              color="amber"
            />
          </div>
        </div>
      )}
    </div>
  )
}
