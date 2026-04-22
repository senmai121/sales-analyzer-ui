'use client'

import { useState, useCallback, useRef } from 'react'

interface SSEState<T> {
  data: T | null
  progress: string | null
  error: string | null
  loading: boolean
}

export function useSSE<T>() {
  const [state, setState] = useState<SSEState<T>>({
    data: null,
    progress: null,
    error: null,
    loading: false,
  })
  const esRef = useRef<EventSource | null>(null)

  const start = useCallback((url: string) => {
    // Close previous connection
    if (esRef.current) {
      esRef.current.close()
    }

    setState({ data: null, progress: null, error: null, loading: true })

    const es = new EventSource(url)
    esRef.current = es

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data)
        if (event.type === 'progress') {
          setState((prev) => ({ ...prev, progress: event.message }))
        } else if (event.type === 'result') {
          setState({ data: event.data, progress: null, error: null, loading: false })
          es.close()
        } else if (event.type === 'error') {
          setState({ data: null, progress: null, error: event.message, loading: false })
          es.close()
        }
      } catch {
        setState({ data: null, progress: null, error: 'Invalid response from server', loading: false })
        es.close()
      }
    }

    es.onerror = () => {
      setState({ data: null, progress: null, error: 'Connection error. Is the API server running?', loading: false })
      es.close()
    }
  }, [])

  const reset = useCallback(() => {
    if (esRef.current) esRef.current.close()
    setState({ data: null, progress: null, error: null, loading: false })
  }, [])

  return { ...state, start, reset }
}
