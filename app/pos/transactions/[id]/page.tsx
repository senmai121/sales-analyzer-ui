'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import type { POSOrderDetail } from '@/lib/types'

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

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase()
  let cls = ''
  if (s === 'PAID') cls = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  else if (s === 'PENDING') cls = 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  else if (s === 'CANCELLED') cls = 'bg-red-500/10 text-red-400 border-red-500/20'
  else cls = 'bg-white/5 text-ink-3 border-white/10'

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {status}
    </span>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-white/[0.04] rounded-xl animate-pulse ${className ?? ''}`} />
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-white/[0.07]">
        <h2 className="font-semibold text-ink text-sm">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ─── Detail Content ───────────────────────────────────────────────────────────

function OrderDetailContent() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [order, setOrder] = useState<POSOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)

    apiFetch(`/api/proxy/api/pos/orders/${id}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true)
          return null
        }
        if (!res.ok) throw new Error(`ไม่สามารถโหลดข้อมูลได้: ${res.statusText}`)
        return res.json() as Promise<POSOrderDetail>
      })
      .then((data) => {
        if (data) setOrder(data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center gap-3 text-ink-3">
        <span className="text-5xl opacity-20">◻</span>
        <p className="text-lg font-semibold">ไม่พบออเดอร์ #{id}</p>
        <button
          onClick={() => router.push('/pos/transactions')}
          className="mt-2 px-4 py-2 rounded-xl text-sm font-semibold border border-white/[0.1] text-ink-2 hover:text-ink hover:border-white/20 transition-all"
        >
          ← กลับรายการ
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
        <button
          onClick={() => router.push('/pos/transactions')}
          className="px-4 py-2 rounded-xl text-sm font-semibold border border-white/[0.1] text-ink-2 hover:text-ink transition-all"
        >
          ← กลับรายการ
        </button>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* ── Back button ── */}
      <button
        onClick={() => router.push('/pos/transactions')}
        className="flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink transition-colors"
      >
        <span>←</span>
        <span>รายการธุรกรรม</span>
      </button>

      {/* ── Header ── */}
      <div className="bg-card border border-white/[0.07] rounded-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl font-bold text-ink">Order #{order.order_id}</h1>
            <p className="text-ink-3 text-sm mt-0.5">{formatDateTime(order.created_at)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.07]">
          <div>
            <p className="text-xs text-ink-3 font-semibold uppercase tracking-wider mb-0.5">สาขา</p>
            <p className="text-sm text-ink font-medium">{order.store_name}</p>
          </div>
          <div>
            <p className="text-xs text-ink-3 font-semibold uppercase tracking-wider mb-0.5">ลูกค้า</p>
            <p className="text-sm text-ink font-medium">{order.customer_name || '—'}</p>
          </div>
        </div>
      </div>

      {/* ── Items ── */}
      <SectionCard title="รายการสินค้า">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-ink-3 text-xs uppercase tracking-wider border-b border-white/[0.04]">
                <th className="text-left px-5 py-3 font-semibold">สินค้า</th>
                <th className="text-left px-5 py-3 font-semibold">ขนาด</th>
                <th className="text-right px-5 py-3 font-semibold">จำนวน</th>
                <th className="text-right px-5 py-3 font-semibold">ราคา/ชิ้น</th>
                <th className="text-right px-5 py-3 font-semibold">รวม</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-t border-white/[0.04] hover:bg-white/[0.01]">
                  <td className="px-5 py-3">
                    <p className="text-ink font-medium">{item.product_name}</p>
                    {item.brand_name && (
                      <p className="text-xs text-ink-3 mt-0.5">{item.brand_name}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-2 text-sm">{item.size ?? '—'}</td>
                  <td className="px-5 py-3 text-right text-ink-2">{item.quantity}</td>
                  <td className="px-5 py-3 text-right text-ink-2">{formatRevenue(item.unit_price)}</td>
                  <td className="px-5 py-3 text-right font-semibold text-ink">{formatRevenue(item.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Summary ── */}
        <div className="px-5 py-4 border-t border-white/[0.07] space-y-2">
          <div className="flex justify-between text-sm text-ink-2">
            <span>ราคาก่อน VAT</span>
            <span>{formatRevenue(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-2">
            <span>VAT</span>
            <span>{formatRevenue(order.vat_amount)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-ink pt-2 border-t border-white/[0.07]">
            <span>ยอดรวมทั้งสิ้น</span>
            <span className="text-mint">{formatRevenue(order.total_amount)}</span>
          </div>
        </div>
      </SectionCard>

      {/* ── Payments ── */}
      {order.payments && order.payments.length > 0 && (
        <SectionCard title="การชำระเงิน">
          <div className="divide-y divide-white/[0.04]">
            {order.payments.map((payment, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm text-ink font-medium capitalize">{payment.method}</p>
                  {payment.reference && (
                    <p className="text-xs text-ink-3 mt-0.5">Ref: {payment.reference}</p>
                  )}
                </div>
                <span className="text-sm font-semibold text-ink">{formatRevenue(payment.amount)}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function TransactionDetailPage() {
  return (
    <AuthGuard>
      <OrderDetailContent />
    </AuthGuard>
  )
}
