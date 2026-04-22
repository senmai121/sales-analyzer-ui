'use client'

import { useState, useEffect } from 'react'
import { getCategories } from '@/lib/api'
import { RankedProduct, ProductCategory } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'
import { useSSE } from '@/lib/useSSE'
import { SSELoader } from '@/components/SSELoader'

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  if (pct >= 80)
    return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-mint/10 text-mint border border-mint/20">{pct}%</span>
  if (pct >= 60)
    return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">{pct}%</span>
  if (pct >= 40)
    return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-400/10 text-orange-400 border border-orange-400/20">{pct}%</span>
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-coral/10 text-coral border border-coral/20">{pct}%</span>
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl leading-none">🥇</span>
  if (rank === 2) return <span className="text-2xl leading-none">🥈</span>
  if (rank === 3) return <span className="text-2xl leading-none">🥉</span>
  return (
    <span className="w-8 h-8 rounded-full border border-white/[0.08] text-ink-2 text-sm font-bold flex items-center justify-center">
      {rank}
    </span>
  )
}

function RankingContent() {
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [fetched, setFetched] = useState(false)
  const sse = useSSE<{ ranked_products: RankedProduct[] }>()

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  function handleFetch(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setFetched(true)
    const params = new URLSearchParams()
    if (categoryId) params.set('category_id', String(categoryId))
    sse.start(`/api/proxy/api/products/ranking/stream?${params.toString()}`)
  }

  const results = sse.data?.ranked_products ?? []

  return (
    <div>
      <div className="mb-8 animate-fade-up">
        <h1 className="font-heading text-3xl font-bold text-ink mb-1">AI Product Ranking</h1>
        <p className="text-ink-2 text-sm">AI-scored rankings with detailed reasoning for each product.</p>
      </div>

      <form onSubmit={handleFetch} className="animate-fade-up-1 bg-card rounded-xl border border-white/[0.07] p-5 mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-ink-2 uppercase tracking-widest">Category</label>
          <select
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-canvas border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-mint/40 transition-all min-w-44"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={sse.loading}
          className="bg-mint text-canvas px-6 py-2 rounded-lg text-sm font-bold hover:bg-mint-dim disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {sse.loading ? 'Analyzing…' : 'Get Rankings'}
        </button>
      </form>

      {sse.loading && <SSELoader message={sse.progress} />}

      {sse.error && (
        <div className="rounded-xl border border-coral/20 bg-coral/5 px-4 py-3 text-sm text-coral">
          {sse.error}
        </div>
      )}

      {!sse.loading && fetched && !sse.error && results.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-3 opacity-20">🏆</p>
          <p className="font-semibold text-ink-2">No ranked products found</p>
          <p className="text-sm text-ink-3 mt-1">Try different filter options.</p>
        </div>
      )}

      {!sse.loading && results.length > 0 && (
        <div className="space-y-2">
          {results.map((item, i) => (
            <div
              key={item.product_id}
              className="animate-fade-up bg-card rounded-xl border border-white/[0.07] p-5 flex gap-4 items-start hover:border-white/[0.12] transition-all"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="shrink-0 w-10 flex items-center justify-center mt-0.5">
                <RankBadge rank={item.rank} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h3 className="font-semibold text-ink text-sm">{item.product_name}</h3>
                  <ScoreBadge score={item.score} />
                </div>
                <p className="text-xs text-ink-2 leading-relaxed">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RankingPage() {
  return (
    <AuthGuard>
      <RankingContent />
    </AuthGuard>
  )
}
