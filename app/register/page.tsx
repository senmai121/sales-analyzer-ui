'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const inputClass =
  'w-full bg-canvas border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-mint/40 focus:ring-1 focus:ring-mint/10 transition-all'
const labelClass = 'block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-2'

export default function RegisterPage() {
  const { login } = useAuth()
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? data.message ?? 'Registration failed. Please try again.')
      }

      const data = await res.json()
      login(data.user)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="font-heading text-2xl font-bold text-mint mb-2">SalesAnalyzer</div>
          <h1 className="text-xl font-semibold text-ink">Create an account</h1>
          <p className="text-sm text-ink-2 mt-1">Get started for free today</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="username">Username</label>
              <input
                id="username" type="text" required value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="janesmith" className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="email">Email</label>
              <input
                id="email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="password">Password</label>
              <input
                id="password" type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword" type="password" required value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" className={inputClass}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-coral/20 bg-coral/5 px-4 py-3 text-sm text-coral">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-bold bg-mint text-canvas hover:bg-mint-dim disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-2 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-mint hover:text-mint-dim font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
