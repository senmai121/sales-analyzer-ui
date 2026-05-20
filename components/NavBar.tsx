'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLang } from '@/lib/lang-context'

export default function NavBar() {
  const { user, logout } = useAuth()
  const { t, lang, toggle } = useLang()
  const router = useRouter()
  const pathname = usePathname()

  const navLinks = [
    { href: '/pos', label: t.nav.pos },
    { href: '/pos/dashboard', label: t.nav.dashboard },
    { href: '/pos/transactions', label: t.nav.transactions },
    { href: '/search', label: t.nav.search },
    { href: '/ranking', label: t.nav.ranking },
    { href: '/insights', label: t.nav.insights },
  ]

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-md bg-canvas/80">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="font-heading text-base font-semibold text-mint tracking-tight shrink-0">
          {t.brand}
        </Link>

        <div className="flex items-center gap-0.5">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'text-mint bg-mint/10'
                    : 'text-ink-2 hover:text-ink hover:bg-white/[0.04]'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        <div className="ml-auto flex items-center gap-2 text-sm">
          {/* Language toggle */}
          <button
            onClick={toggle}
            className="px-2.5 py-1 rounded-md text-xs font-bold border border-white/[0.08] text-ink-3 hover:text-ink hover:border-white/[0.16] transition-all"
          >
            {lang === 'en' ? 'TH' : 'EN'}
          </button>

          {user ? (
            <>
              <span className="text-ink-2 text-sm">
                <span className="text-ink font-semibold">{user.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-ink-2 border border-white/[0.08] hover:border-coral/30 hover:text-coral transition-all"
              >
                {t.nav.logout}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm font-medium text-ink-2 hover:text-ink transition-colors"
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-mint text-canvas hover:bg-mint-dim transition-colors"
              >
                {t.nav.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
