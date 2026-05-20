'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import type { POSOrder, POSLocation } from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRevenue(n: number): string {
  return '฿' + n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('th-TH')
}

async function apiFetch(path: string): Promise<Response> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
  })
  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new Error('Unauthorized. Please log in.')
  }
  return res
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase()
  let cls = ''
  if (s === 'PAID') cls = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  else if (s === 'PENDING') cls = 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  else if (s === 'CANCELLED') cls = 'bg-red-500/10 text-red-400 border-red-500/20'
  else cls = 'bg-white/5 text-ink-3 border-white/10'

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {status}
    </span>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-white/[0.04] rounded-xl animate-pulse ${className ?? ''}`} />
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <tr>
      <td colSpan={7}>
        <div className="flex flex-col items-center justify-center py-16 text-ink-3 gap-2">
          <span className="text-4xl opacity-20">◻</span>
          <p className="text-sm font-medium">ไม่พบรายการ</p>
          <p className="text-xs opacity-60">ลองปรับเงื่อนไขการค้นหา</p>
        </div>
      </td>
    </tr>
  )
}

// ─── Error Banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
      {message}
    </div>
  )
}

// ─── Page Content ─────────────────────────────────────────────────────────────

function TransactionsContent() {
  const router = useRouter()

  const [locations, setLocations] = useState<POSLocation[]>([])
  const [orders, setOrders] = useState<POSOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const today = new Date().toISOString().slice(0, 10)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo)
  const [dateTo, setDateTo] = useState(today)
  const [storeId, setStoreId] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  // Fetch locations on mount
  useEffect(() => {
    apiFetch('/api/proxy/api/pos/locations')
      .then((res) => {
        if (!res.ok) throw new Error('ไม่สามารถโหลดรายการสาขาได้')
        return res.json() as Promise<POSLocation[]>
      })
      .then((locs) => setLocations(locs ?? []))
      .catch((err) => setError(err.message))
  }, [])

  const fetchOrders = useCallback(() => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    if (dateFrom) params.set('date_from', dateFrom)
    if (dateTo) params.set('date_to', dateTo)
    if (storeId) params.set('store_id', storeId)
    if (status) params.set('status', status)
    params.set('limit', '100')
    params.set('offset', '0')

    apiFetch(`/api/proxy/api/pos/orders?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`ไม่สามารถโหลดรายการได้: ${res.statusText}`)
        return res.json() as Promise<POSOrder[]>
      })
      .then((data) => setOrders(data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [dateFrom, dateTo, storeId, status])

  // Fetch on mount
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">รายการธุรกรรม</h1>
        <p className="text-ink-3 text-sm mt-0.5">ค้นหาและดูรายละเอียดออเดอร์ทั้งหมด</p>
      </div>

      {/* ── Filters ── */}
      <div className="bg-card border border-white/[0.07] rounded-2xl p-5">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Date From */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-3 font-semibold uppercase tracking-wider">จากวันที่</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-canvas border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-ink focus:outline-none focus:border-mint/30 focus:ring-1 focus:ring-mint/10 transition-all"
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-3 font-semibold uppercase tracking-wider">ถึงวันที่</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-canvas border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-ink focus:outline-none focus:border-mint/30 focus:ring-1 focus:ring-mint/10 transition-all"
            />
          </div>

          {/* Store */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-3 font-semibold uppercase tracking-wider">สาขา</label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="bg-canvas border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-ink focus:outline-none focus:border-mint/30 focus:ring-1 focus:ring-mint/10 transition-all min-w-[140px]"
            >
              <option value="">ทุกสาขา</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-3 font-semibold uppercase tracking-wider">สถานะ</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-canvas border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-ink focus:outline-none focus:border-mint/30 focus:ring-1 focus:ring-mint/10 transition-all min-w-[140px]"
            >
              <option value="">ทั้งหมด</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Search button */}
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-mint text-canvas hover:bg-mint/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'กำลังโหลด…' : 'ค้นหา'}
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && <ErrorBanner message={error} />}

      {/* ── Table ── */}
      <div className="bg-card border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] text-ink-3 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold w-12">ลำดับ</th>
                <th className="text-left px-5 py-3 font-semibold">วันที่-เวลา</th>
                <th className="text-left px-5 py-3 font-semibold">สาขา</th>
                <th className="text-left px-5 py-3 font-semibold">ลูกค้า</th>
                <th className="text-right px-5 py-3 font-semibold">จำนวนรายการ</th>
                <th className="text-right px-5 py-3 font-semibold">ยอดรวม</th>
                <th className="text-center px-5 py-3 font-semibold">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-t border-white/[0.04]">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-5 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <EmptyState />
              ) : (
                orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/pos/transactions/${order.id}`)}
                    className="border-t border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 text-ink-3 text-xs">{idx + 1}</td>
                    <td className="px-5 py-3 text-ink-2 text-xs whitespace-nowrap">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="px-5 py-3 text-ink font-medium">{order.store_name}</td>
                    <td className="px-5 py-3 text-ink-2">{order.customer_name || '—'}</td>
                    <td className="px-5 py-3 text-right text-ink-2">{order.items_count}</td>
                    <td className="px-5 py-3 text-right font-semibold text-ink">
                      {formatRevenue(order.total_amount)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Row count */}
        {!loading && orders.length > 0 && (
          <div className="px-5 py-3 border-t border-white/[0.07] text-xs text-ink-3">
            แสดง {orders.length} รายการ
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  return (
    <AuthGuard>
      <TransactionsContent />
    </AuthGuard>
  )
}
