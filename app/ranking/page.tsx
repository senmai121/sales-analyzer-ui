'use client'

import { useState, useEffect } from 'react'
import { getRankedProducts, getCategories } from '@/lib/api'
import { RankedProduct, ProductCategory } from '@/lib/types'

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  let color = 'bg-red-100 text-red-700'
  if (pct >= 80) color = 'bg-emerald-100 text-emerald-700'
  else if (pct >= 60) color = 'bg-yellow-100 text-yellow-700'
  else if (pct >= 40) color = 'bg-orange-100 text-orange-700'
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {pct}%
    </span>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>
  if (rank === 2) return <span className="text-2xl">🥈</span>
  if (rank === 3) return <span className="text-2xl">🥉</span>
  return (
    <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-sm font-bold flex items-center justify-center">
      {rank}
    </span>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )
}

export default function RankingPage() {
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [results, setResults] = useState<RankedProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFetched(true)
    try {
      const data = await getRankedProducts(categoryId)
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rankings.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Product Ranking</h1>
      <p className="text-gray-500 mb-6">
        Filter by category to see AI-scored product rankings with reasoning.
      </p>

      <form onSubmit={handleFetch} className="bg-white rounded-xl border border-gray-200 p-5 mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 min-w-44">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Category</label>
          <select
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Loading...' : 'Get Rankings'}
        </button>
      </form>

      {loading && <Spinner />}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!loading && fetched && !error && results.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🏆</p>
          <p className="text-lg font-medium">No ranked products found</p>
          <p className="text-sm mt-1">Try different filter options.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((item) => (
            <div
              key={item.product_id}
              className="bg-white rounded-xl border border-gray-200 p-5 flex gap-4 items-start hover:border-indigo-200 transition-colors"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-10">
                <RankBadge rank={item.rank} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-gray-800 text-base">{item.product_name}</h3>
                  <ScoreBadge score={item.score} />
                </div>
                <p className="text-sm text-gray-500">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
