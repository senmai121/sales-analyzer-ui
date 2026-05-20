'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import {
  getPOSLocations,
  getPOSStats,
  getPOSRevenue,
  getPOSTopProducts,
  getPOSPaymentMethods,
  getPOSInventory,
} from '@/lib/api'
import type {
  POSLocation,
  POSStats,
  RevenueDataPoint,
  TopProduct,
  PaymentMethodStat,
  InventoryItem,
} from '@/lib/types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from 'recharts'

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRevenue(n: number): string {
  return '฿' + n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatInt(n: number): string {
  return n.toLocaleString('th-TH')
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`bg-white/[0.04] rounded-xl animate-pulse ${className ?? ''}`}
    />
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: string
  label: string
  value: string
  accent: string
}

function StatCard({ icon, label, value, accent }: StatCardProps) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl border border-white/[0.07] px-5 py-4 bg-card"
      style={{ borderLeftColor: accent, borderLeftWidth: 3 }}
    >
      <span className="text-2xl shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-ink-3 font-semibold uppercase tracking-wider truncate">{label}</p>
        <p className="text-xl font-bold text-ink mt-0.5">{value}</p>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-ink-3 gap-2">
      <span className="text-4xl opacity-20">◻</span>
      <p className="text-sm font-medium">ยังไม่มีข้อมูล</p>
      <p className="text-xs opacity-60">เริ่มสร้างออเดอร์แรกได้เลย</p>
    </div>
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

// ─── Custom Tooltip (revenue chart) ──────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { color: string; name: string; value: number }[]
  label?: string
}) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-card border border-white/[0.1] rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-ink-2 font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'revenue' ? `รายได้: ${formatRevenue(p.value)}` : `ออเดอร์: ${formatInt(p.value)}`}
        </p>
      ))}
    </div>
  )
}

// ─── Dashboard Content ────────────────────────────────────────────────────────

function DashboardContent() {
  const [locations, setLocations] = useState<POSLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<number | undefined>(undefined)

  const [stats, setStats] = useState<POSStats | null>(null)
  const [revenue, setRevenue] = useState<RevenueDataPoint[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodStat[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])

  const [loadingLocations, setLoadingLocations] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch locations on mount ──
  useEffect(() => {
    setLoadingLocations(true)
    getPOSLocations()
      .then((locs) => {
        setLocations(locs ?? [])
        if (locs && locs.length > 0) {
          setSelectedLocation(locs[0].id) // id is now number
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingLocations(false))
  }, [])

  // ── Fetch dashboard data when location changes ──
  useEffect(() => {
    if (loadingLocations) return

    setLoadingData(true)
    setError(null)

    Promise.all([
      getPOSStats(selectedLocation),
      getPOSRevenue(selectedLocation, 7),
      getPOSTopProducts(selectedLocation, 10),
      getPOSPaymentMethods(selectedLocation),
      getPOSInventory(selectedLocation),
    ])
      .then(([s, r, tp, pm, inv]) => {
        setStats(s)
        setRevenue(r ?? [])
        setTopProducts(tp ?? [])
        setPaymentMethods(pm ?? [])
        setInventory(inv ?? [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingData(false))
  }, [selectedLocation, loadingLocations])

  const lowStockItems = inventory.filter((item) => item.quantity <= 5)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">POS Dashboard</h1>
          <p className="text-ink-3 text-sm mt-0.5">ภาพรวมยอดขายและสต็อก</p>
        </div>

        {/* Location selector */}
        {!loadingLocations && locations.length > 0 && (
          <select
            value={selectedLocation ?? ''}
            onChange={(e) => setSelectedLocation(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-card border border-white/[0.1] rounded-xl px-4 py-2 text-sm text-ink focus:outline-none focus:border-mint/30 focus:ring-1 focus:ring-mint/10 transition-all"
          >
            <option value="">ทุกสาขา</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        )}
        {loadingLocations && <Skeleton className="w-40 h-10" />}
      </div>

      {/* ── Error ── */}
      {error && <ErrorBanner message={error} />}

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {loadingData || !stats ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : (
          <>
            <StatCard
              icon="💰"
              label="รายได้วันนี้"
              value={formatRevenue(stats.today_revenue)}
              accent={COLORS[1]}
            />
            <StatCard
              icon="🛒"
              label="ออเดอร์"
              value={formatInt(stats.today_orders)}
              accent={COLORS[0]}
            />
            <StatCard
              icon="📊"
              label="เฉลี่ย/บิล"
              value={formatRevenue(stats.avg_order_value)}
              accent={COLORS[2]}
            />
            <StatCard
              icon="⏳"
              label="รอดำเนินการ"
              value={formatInt(stats.pending_orders)}
              accent={COLORS[3]}
            />
            <StatCard
              icon="⚠️"
              label="stock ใกล้หมด"
              value={formatInt(stats.low_stock_count)}
              accent={COLORS[4]}
            />
          </>
        )}
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <div className="bg-card border border-white/[0.07] rounded-2xl p-5">
          <h2 className="font-semibold text-ink text-sm mb-4">รายได้ 7 วัน</h2>
          {loadingData ? (
            <Skeleton className="h-56" />
          ) : revenue.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="revenue"
                  orientation="left"
                  tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-ink-2">
                      {value === 'revenue' ? 'รายได้' : 'ออเดอร์'}
                    </span>
                  )}
                />
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS[1]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[1], r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  stroke={COLORS[0]}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={{ fill: COLORS[0], r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment Method Donut */}
        <div className="bg-card border border-white/[0.07] rounded-2xl p-5">
          <h2 className="font-semibold text-ink text-sm mb-4">สัดส่วน Payment Method</h2>
          {loadingData ? (
            <Skeleton className="h-56" />
          ) : paymentMethods.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    dataKey="total"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {paymentMethods.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatRevenue(Number(value))}
                    contentStyle={{
                      background: '#1a1a2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {paymentMethods.map((pm, i) => (
                  <div key={pm.method} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-ink capitalize truncate">{pm.method}</p>
                      <p className="text-xs text-ink-3">{formatRevenue(pm.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Bar Chart */}
        <div className="bg-card border border-white/[0.07] rounded-2xl p-5">
          <h2 className="font-semibold text-ink text-sm mb-4">Top 10 สินค้าขายดี</h2>
          {loadingData ? (
            <Skeleton className="h-72" />
          ) : topProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  layout="vertical"
                  data={topProducts}
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="product_name"
                    width={120}
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) => v.length > 18 ? v.slice(0, 18) + '…' : v}
                  />
                  <Tooltip
                    formatter={(value) => [formatInt(Number(value)), 'จำนวนขาย']}
                    contentStyle={{
                      background: '#1a1a2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="total_qty" radius={[0, 6, 6, 0]}>
                    {topProducts.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {topProducts.some((p) => p.brand_name) && (
                <div className="mt-3 space-y-1 overflow-auto max-h-36">
                  {topProducts.map((p, i) => (
                    <div key={p.product_id} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-ink font-medium truncate flex-1">{p.product_name}</span>
                      {p.brand_name && (
                        <span className="text-ink-3 shrink-0">{p.brand_name}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Low Stock Table */}
        <div className="bg-card border border-white/[0.07] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-ink text-sm">สินค้า Stock ใกล้หมด</h2>
            {!loadingData && lowStockItems.length > 0 && (
              <span className="ml-auto bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold px-2 py-0.5 rounded-full">
                {lowStockItems.length} รายการ
              </span>
            )}
          </div>

          {loadingData ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : lowStockItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-ink-3 gap-2">
              <span className="text-3xl opacity-30">✓</span>
              <p className="text-sm font-medium">Stock ปกติ</p>
              <p className="text-xs opacity-60">ไม่มีสินค้าใกล้หมด</p>
            </div>
          ) : (
            <div className="overflow-auto max-h-72">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-ink-3 uppercase tracking-wider">
                    <th className="text-left pb-2 font-semibold">สินค้า</th>
                    <th className="text-left pb-2 font-semibold">แบรนด์</th>
                    <th className="text-left pb-2 font-semibold">ไซส์</th>
                    <th className="text-left pb-2 font-semibold">สาขา</th>
                    <th className="text-right pb-2 font-semibold">คงเหลือ</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item, i) => (
                    <tr key={i} className="border-t border-white/[0.04]">
                      <td className="py-2 pr-2 text-ink font-medium max-w-[120px] truncate">
                        {item.product_name}
                      </td>
                      <td className="py-2 pr-2 text-ink-3">{item.brand_name ?? '—'}</td>
                      <td className="py-2 pr-2 text-ink-2">{item.size}</td>
                      <td className="py-2 pr-2 text-ink-3 text-xs">{item.store_name}</td>
                      <td className="py-2 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-xs ${
                            item.quantity === 0
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : item.quantity <= 2
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}
                        >
                          {item.quantity === 0 ? 'หมด' : item.quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function POSDashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
