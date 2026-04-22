'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

const features = [
  {
    title: 'Smart Search',
    description:
      'Search products using natural language. Ask for "comfortable running shoes for women" and get AI-matched results.',
    href: '/search',
    icon: '⌕',
    cta: 'Search Products',
  },
  {
    title: 'Product Ranking',
    description:
      'AI-powered product rankings filtered by category, with detailed score explanations.',
    href: '/ranking',
    icon: '◈',
    cta: 'View Rankings',
  },
  {
    title: 'Business Insights',
    description:
      'Catalog-wide AI analysis: top brands, underperforming products, category gaps, and pricing tips.',
    href: '/insights',
    icon: '◉',
    cta: 'View Insights',
  },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <div>
      <div className="mb-12 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-mint/20 bg-mint/5 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
          <span className="text-xs font-semibold text-mint tracking-widest uppercase">AI-Powered Analytics</span>
        </div>
        <h1 className="font-heading text-5xl font-bold text-ink mb-4 leading-tight tracking-tight">
          Product Catalog<br />
          <span className="text-mint">Intelligence</span>
        </h1>
        <p className="text-lg text-ink-2 max-w-xl leading-relaxed">
          Leverage AI to search, rank, and analyze your product catalog.
          Actionable insights from customer reviews — all in one place.
        </p>
      </div>

      {!user && (
        <div className="mb-8 animate-fade-up-1 p-5 rounded-xl border border-mint/20 bg-mint/5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-ink mb-0.5">Sign in to get started</p>
            <p className="text-sm text-ink-2">Access Search, Ranking, and Insights with a free account.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-ink-2 border border-white/[0.08] hover:border-white/[0.16] hover:text-ink transition-all"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-mint text-canvas hover:bg-mint-dim transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {features.map((f, i) => (
          <div
            key={f.href}
            className={`animate-fade-up-${i + 1} group rounded-xl border border-white/[0.07] bg-card p-6 flex flex-col hover:border-white/[0.14] hover:-translate-y-0.5 transition-all`}
          >
            <div className="text-3xl mb-4 opacity-50 text-mint">{f.icon}</div>
            <h2 className="font-heading text-lg font-semibold text-ink mb-2">{f.title}</h2>
            <p className="text-sm text-ink-2 flex-1 mb-5 leading-relaxed">{f.description}</p>
            <Link
              href={f.href}
              className="self-start text-sm font-semibold text-mint hover:text-mint-dim transition-colors flex items-center gap-1.5 group-hover:gap-2.5"
            >
              {f.cta} <span className="transition-all">→</span>
            </Link>
          </div>
        ))}
      </div>

      <div className="animate-fade-up-4 rounded-xl border border-white/[0.07] bg-card p-6">
        <h3 className="font-heading text-sm font-semibold text-ink-2 uppercase tracking-widest mb-4">How it works</h3>
        <ol className="space-y-3">
          {[
            ['Smart Search', 'Find products by natural language query — click any result to see its full AI summary.'],
            ['Product Ranking', 'Filter by category to see AI-scored rankings with detailed reasoning.'],
            ['Business Insights', 'Get catalog-wide AI analysis covering brand performance, gaps, and pricing strategy.'],
          ].map(([title, desc], i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-mint/10 border border-mint/20 flex items-center justify-center text-xs font-bold text-mint shrink-0">
                {i + 1}
              </span>
              <span className="text-ink-2 leading-relaxed">
                <strong className="text-ink font-semibold">{title}: </strong>
                {desc}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
