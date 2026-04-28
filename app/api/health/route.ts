import { NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8080'

export async function GET() {
  fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5_000) }).catch(() => {})
  return NextResponse.json({ ok: true })
}
