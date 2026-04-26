'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useLang } from '@/lib/lang-context'

export default function Home() {
  const { user } = useAuth()
  const { t } = useLang()
  const h = t.home

  return (
    <div>
      {/* ── Hero ── */}
      <div className="mb-12 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-mint/20 bg-mint/5 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
          <span className="text-xs font-semibold text-mint tracking-widest uppercase">{h.badge}</span>
        </div>
        <h1 className="font-heading text-5xl font-bold text-ink mb-4 leading-tight tracking-tight">
          {h.hero1}<br />
          <span className="text-mint">{h.hero2}</span>
        </h1>
        <p className="text-lg text-ink-2 max-w-xl leading-relaxed mb-8">{h.desc}</p>

        {user ? (
          <Link
            href="/pos"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-mint text-canvas text-base font-bold hover:bg-mint-dim transition-all shadow-lg shadow-mint/10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {h.openPOS}
          </Link>
        ) : (
          <div className="flex gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-mint text-canvas text-base font-bold hover:bg-mint-dim transition-all shadow-lg shadow-mint/10"
            >
              {h.getStarted}
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3.5 rounded-xl text-base font-medium text-ink-2 border border-white/[0.08] hover:border-white/[0.16] hover:text-ink transition-all"
            >
              {h.signIn}
            </Link>
          </div>
        )}
      </div>

      {/* ── Feature pills ── */}
      <div className="grid grid-cols-3 gap-3 mb-12 animate-fade-up-1">
        {h.features.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/[0.07] bg-card px-4 py-3.5 flex items-center gap-3"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium text-ink-2 leading-snug">{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── Analytics tools ── */}
      <div className="animate-fade-up-1">
        <p className="text-xs font-semibold text-ink-3 uppercase tracking-widest mb-4">{h.analyticsTitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {h.analyticsTools.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group rounded-xl border border-white/[0.07] bg-card p-5 flex items-start gap-4 hover:border-white/[0.14] hover:-translate-y-0.5 transition-all"
            >
              <span className="text-2xl opacity-40 text-mint mt-0.5 shrink-0">{f.icon}</span>
              <div>
                <h2 className="font-semibold text-ink text-sm mb-1">{f.title}</h2>
                <p className="text-xs text-ink-2 leading-relaxed">{f.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
