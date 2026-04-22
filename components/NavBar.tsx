'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const navLinks = [
  { href: '/search', label: 'Search' },
  { href: '/ranking', label: 'Ranking' },
  { href: '/insights', label: 'Insights' },
]

export default function NavBar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-md bg-canvas/80">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="font-heading text-base font-semibold text-mint tracking-tight shrink-0">
          SalesAnalyzer
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

        <div className="ml-auto flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-ink-2 text-sm">
                <span className="text-ink font-semibold">{user.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-ink-2 border border-white/[0.08] hover:border-coral/30 hover:text-coral transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm font-medium text-ink-2 hover:text-ink transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-mint text-canvas hover:bg-mint-dim transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
