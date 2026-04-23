import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const API_URL = process.env.API_URL || 'http://localhost:8080'

async function proxyRequest(request: NextRequest, params: Promise<{ path: string[] }>) {
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get('auth_token')

  if (!tokenCookie?.value) {
    return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
  }

  const { path } = await params
  const pathStr = path.join('/')
  const search = request.nextUrl.search ?? ''
  const targetUrl = `${API_URL}/${pathStr}${search}`

  const headers: HeadersInit = {
    Authorization: `Bearer ${tokenCookie.value}`,
  }

  const contentType = request.headers.get('content-type')
  if (contentType) {
    headers['Content-Type'] = contentType
  }

  let body: BodyInit | undefined
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.arrayBuffer().then((buf) => (buf.byteLength > 0 ? buf : undefined))
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30_000)

  try {
    const goRes = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const contentType = goRes.headers.get('content-type') ?? ''

    if (contentType.includes('text/event-stream')) {
      return new NextResponse(goRes.body, {
        status: goRes.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      })
    }

    const responseBody = await goRes.arrayBuffer()
    const responseHeaders = new Headers()

    const forwardHeaders = ['content-type', 'cache-control', 'etag', 'last-modified']
    for (const header of forwardHeaders) {
      const value = goRes.headers.get(header)
      if (value) responseHeaders.set(header, value)
    }

    return new NextResponse(responseBody, {
      status: goRes.status,
      headers: responseHeaders,
    })
  } catch (err) {
    clearTimeout(timeoutId)
    if ((err as Error).name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 })
    }
    return NextResponse.json({ error: 'Failed to reach API server' }, { status: 502 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, params)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, params)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, params)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, params)
}
