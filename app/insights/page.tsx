'use client'

import { Insights } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'
import { useSSE } from '@/lib/useSSE'
import { SSELoader } from '@/components/SSELoader'

function InsightSection({
  title, icon, items, color,
}: {
  title: string
  icon: string
  items: string[]
  color: 'mint' | 'coral' | 'azure' | 'gold'
}) {
  if (!items || items.length === 0) return null

  const styles = {
    mint:  { wrap: 'border-mint/20 bg-mint/5',   head: 'text-mint',  dot: 'bg-mint' },
    coral: { wrap: 'border-coral/20 bg-coral/5', head: 'text-coral', dot: 'bg-coral' },
    azure: { wrap: 'border-azure/20 bg-azure/5', head: 'text-azure', dot: 'bg-azure' },
    gold:  { wrap: 'border-gold/20 bg-gold/5',   head: 'text-gold',  dot: 'bg-gold' },
  }
  const s = styles[color]

  return (
    <div className={`rounded-xl border p-5 ${s.wrap}`}>
      <h3 className={`font-semibold text-sm mb-3 flex items-center gap-2 ${s.head}`}>
        <span>{icon}</span>{title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
            <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function InsightsContent() {
  const sse = useSSE<Insights>()
  const insights = sse.data

  function handleFetch() {
    sse.start('/api/proxy/api/insights/stream')
  }

  return (
    <div>
      <div className="mb-8 animate-fade-up">
        <h1 className="font-heading text-3xl font-bold text-ink mb-1">Business Insights</h1>
        <p className="text-ink-2 text-sm">AI-powered analysis of your entire product catalog.</p>
      </div>

      {!insights && !sse.loading && (
        <div className="animate-fade-up-1 bg-card rounded-xl border border-white/[0.07] p-12 text-center">
          <div className="text-5xl mb-4 opacity-20">◉</div>
          <p className="font-heading text-lg font-semibold text-ink mb-2">Ready to analyze?</p>
          <p className="text-sm text-ink-2 mb-6 max-w-sm mx-auto leading-relaxed">
            Generate AI-powered insights across your entire catalog — top brands, weak spots, gaps, and pricing strategy.
          </p>
          <button
            onClick={handleFetch}
            className="bg-mint text-canvas px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-mint-dim transition-all"
          >
            Generate Insights
          </button>
        </div>
      )}

      {sse.loading && <SSELoader message={sse.progress} />}

      {sse.error && (
        <div className="rounded-xl border border-coral/20 bg-coral/5 px-4 py-3 text-sm text-coral flex items-center gap-3">
          <span>{sse.error}</span>
          <button onClick={handleFetch} className="ml-auto text-xs underline hover:no-underline shrink-0">
            Retry
          </button>
        </div>
      )}

      {insights && !sse.loading && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-ink-3 font-semibold uppercase tracking-widest">
              Generated {new Date(insights.generated_at).toLocaleString()}
            </p>
            <button
              onClick={handleFetch}
              className="text-xs text-mint hover:text-mint-dim font-semibold transition-colors"
            >
              Regenerate →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InsightSection title="Top Performing Brands"    icon="🌟" items={insights.top_performing_brands}    color="mint"  />
            <InsightSection title="Underperforming Products" icon="⚠️" items={insights.underperforming_products} color="coral" />
            <InsightSection title="Category Gaps"            icon="🔎" items={insights.category_gaps}            color="azure" />
            <InsightSection title="Pricing Recommendations"  icon="💡" items={insights.pricing_recommendations}  color="gold"  />
          </div>
        </div>
      )}
    </div>
  )
}

export default function InsightsPage() {
  return (
    <AuthGuard>
      <InsightsContent />
    </AuthGuard>
  )
}
