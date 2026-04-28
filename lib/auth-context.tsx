'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'

interface User {
  id: number
  email: string
  username: string
}

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (user: User) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: async () => {},
})

const TIMEOUT_MS = 2 * 60 * 60 * 1000 // 2 hours
const LA_KEY = '_la'

function touchActivity() {
  if (typeof window !== 'undefined') localStorage.setItem(LA_KEY, String(Date.now()))
}

function sessionExpired() {
  const last = parseInt(localStorage.getItem(LA_KEY) ?? '0', 10)
  return last > 0 && Date.now() - last > TIMEOUT_MS
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const userRef = useRef<User | null>(null)

  useEffect(() => { userRef.current = user }, [user])

  // Hydrate session on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          if (sessionExpired()) {
            fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
          } else {
            setUser(data.user)
            touchActivity()
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  // Track activity + periodic expiry check
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'touchstart'] as const
    events.forEach((e) => document.addEventListener(e, touchActivity, { passive: true }))

    const timer = setInterval(() => {
      if (userRef.current && sessionExpired()) {
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
        setUser(null)
      }
    }, 60_000)

    return () => {
      events.forEach((e) => document.removeEventListener(e, touchActivity))
      clearInterval(timer)
    }
  }, [])

  function login(newUser: User) {
    setUser(newUser)
    touchActivity()
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
