import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get('auth_token')

  if (!tokenCookie?.value) {
    return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
  }

  try {
    // Decode the JWT payload (middle part) — no verification, just UI hydration
    const parts = tokenCookie.value.split('.')
    if (parts.length !== 3) {
      return NextResponse.json({ error: 'invalid token' }, { status: 401 })
    }

    // Base64url decode the payload
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    const decoded = JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'))

    const user = {
      id: decoded.user_id ?? decoded.sub,
      email: decoded.email,
      name: decoded.name ?? '',
    }

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: 'invalid token' }, { status: 401 })
  }
}
