'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { useLang } from '@/lib/lang-context'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductSize {
  size: string
  quantity: number
}

interface Product {
  product_id: number
  sku: string
  product_name: string
  brand_name?: string
  unit_price: number
  sizes: ProductSize[]
}

interface Location {
  id: number
  name: string
  address: string
}

interface Customer {
  id: number
  name: string
  email: string
}

interface CartItem {
  product_id: number
  product_name: string
  size: string
  quantity: number
  unit_price: number
  max_quantity: number
}

interface PaymentEntry {
  method: string
  amount: number
  reference: string
}

type PaymentMethod = 'cash' | 'card' | 'qr' | 'transfer'

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  })
  if (res.status === 401) {
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  return res
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="w-7 h-7 rounded-full border-2 border-mint/20 border-t-mint animate-spin" />
    </div>
  )
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product
  onAddToCart: (product: Product, size: ProductSize) => void
}) {
  const { t } = useLang()
  const [flash, setFlash] = useState<string | null>(null)

  function handleSizeClick(size: ProductSize) {
    if (size.quantity === 0) return
    onAddToCart(product, size)
    setFlash(size.size)
    setTimeout(() => setFlash(null), 400)
  }

  return (
    <div className="bg-card rounded-xl border border-white/[0.07] p-4 hover:border-mint/20 transition-all">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-ink text-sm leading-snug flex-1 mr-2">
          {product.product_name}
        </h3>
        <span className="text-mint font-bold text-sm shrink-0">
          ฿{product.unit_price.toFixed(2)}
        </span>
      </div>
      {product.brand_name && (
        <p className="text-xs text-ink-3 mb-0.5">{product.brand_name}</p>
      )}
      <p className="text-xs text-ink-3 font-mono mb-2">{product.sku}</p>

      <div className="flex flex-wrap gap-1.5">
        {product.sizes && product.sizes.length > 0 ? (
          product.sizes.map((s) => (
            <button
              key={s.size}
              onClick={() => handleSizeClick(s)}
              disabled={s.quantity === 0}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                s.quantity === 0
                  ? 'border-white/[0.04] text-ink-3 bg-transparent cursor-not-allowed opacity-40'
                  : flash === s.size
                  ? 'border-mint bg-mint text-canvas scale-95'
                  : 'border-white/[0.12] text-ink-2 hover:border-mint/40 hover:text-mint hover:bg-mint/5'
              }`}
            >
              {s.size}
              <span className="ml-1 text-ink-3 font-normal">({s.quantity})</span>
            </button>
          ))
        ) : (
          <button
            onClick={() =>
              handleSizeClick({ size: 'One Size', quantity: 99 })
            }
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              flash === 'One Size'
                ? 'border-mint bg-mint text-canvas scale-95'
                : 'border-white/[0.12] text-ink-2 hover:border-mint/40 hover:text-mint hover:bg-mint/5'
            }`}
          >
            {t.pos.addButton}
          </button>
        )}
      </div>
    </div>
  )
}

function CartRow({
  item,
  onQtyChange,
  onRemove,
}: {
  item: CartItem
  onQtyChange: (key: string, delta: number) => void
  onRemove: (key: string) => void
}) {
  const key = `${item.product_id}::${item.size}`
  const subtotal = item.quantity * item.unit_price

  return (
    <div className="flex items-center gap-2 py-2.5 border-b border-white/[0.05] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{item.product_name}</p>
        <p className="text-xs text-ink-3">{item.size} · ฿{item.unit_price.toFixed(2)}</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onQtyChange(key, -1)}
          className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.08] text-ink-2 hover:text-ink hover:bg-white/[0.08] text-xs flex items-center justify-center transition-all"
        >
          −
        </button>
        <span className="w-7 text-center text-sm font-semibold text-ink">{item.quantity}</span>
        <button
          onClick={() => onQtyChange(key, 1)}
          disabled={item.quantity >= item.max_quantity}
          className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.08] text-ink-2 hover:text-ink hover:bg-white/[0.08] text-xs flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      <span className="w-18 text-right text-sm font-semibold text-mint shrink-0">
        ฿{subtotal.toFixed(2)}
      </span>

      <button
        onClick={() => onRemove(key)}
        className="w-6 h-6 rounded-md text-ink-3 hover:text-coral hover:bg-coral/10 flex items-center justify-center transition-all shrink-0"
      >
        ×
      </button>
    </div>
  )
}

// ─── Payment Modal ────────────────────────────────────────────────────────────

interface PaymentModalProps {
  total: number
  onConfirm: (payment: PaymentEntry) => Promise<void>
  onClose: () => void
  paying: boolean
}

function PaymentModal({ total, onConfirm, onClose, paying }: PaymentModalProps) {
  const { t } = useLang()
  const p = t.payment
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [amount, setAmount] = useState(total.toFixed(2))
  const [reference, setReference] = useState('')

  const methods: { key: PaymentMethod; label: string }[] = [
    { key: 'cash', label: p.methods.cash },
    { key: 'card', label: p.methods.card },
    { key: 'qr', label: p.methods.qr },
    { key: 'transfer', label: p.methods.transfer },
  ]

  const needsRef = method !== 'cash'

  function handleConfirm() {
    const amtNum = parseFloat(amount)
    if (isNaN(amtNum) || amtNum <= 0) return
    onConfirm({ method, amount: amtNum, reference: reference.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-white/[0.1] rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-bold text-ink">{p.title}</h2>
          <button
            onClick={onClose}
            className="text-ink-3 hover:text-ink transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="bg-card-bright rounded-xl px-4 py-3 mb-5 text-center">
          <p className="text-xs text-ink-3 uppercase tracking-wider mb-1">{p.totalDue}</p>
          <p className="font-heading text-3xl font-bold text-mint">฿{total.toFixed(2)}</p>
        </div>

        {/* Method tabs */}
        <div className="flex gap-1.5 mb-4">
          {methods.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMethod(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                method === key
                  ? 'bg-mint text-canvas'
                  : 'bg-white/[0.04] text-ink-2 hover:bg-white/[0.07] hover:text-ink border border-white/[0.07]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="mb-3">
          <label className="block text-xs text-ink-3 font-semibold uppercase tracking-wider mb-1.5">
            {p.amountReceived}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={0}
            step={0.01}
            className="w-full bg-canvas border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-mint/30 focus:ring-1 focus:ring-mint/10 transition-all"
          />
          {parseFloat(amount) > total && (
            <p className="text-xs text-gold mt-1">
              {p.change} ฿{(parseFloat(amount) - total).toFixed(2)}
            </p>
          )}
        </div>

        {/* Reference */}
        {needsRef && (
          <div className="mb-4">
            <label className="block text-xs text-ink-3 font-semibold uppercase tracking-wider mb-1.5">
              {p.reference}
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={p.referencePlaceholder}
              className="w-full bg-canvas border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-mint/30 focus:ring-1 focus:ring-mint/10 transition-all"
            />
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={paying || !amount || parseFloat(amount) <= 0}
          className="w-full bg-mint text-canvas py-3 rounded-xl text-sm font-bold hover:bg-mint-dim disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {paying ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-canvas/30 border-t-canvas animate-spin" />
              {p.processing}
            </span>
          ) : (
            p.confirm
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Receipt Screen ───────────────────────────────────────────────────────────

interface ReceiptProps {
  orderId: number
  items: CartItem[]
  subtotal: number
  vatAmount: number
  discount: number
  total: number
  payment: PaymentEntry
  customerName: string
  onNewSale: () => void
}

function ReceiptScreen({
  orderId,
  items,
  subtotal,
  vatAmount,
  discount,
  total,
  payment,
  customerName,
  onNewSale,
}: ReceiptProps) {
  const { t } = useLang()
  const rc = t.receipt
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-mint/20 rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl animate-fade-up">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-mint/10 border border-mint/20 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-heading text-xl font-bold text-ink">{rc.title}</h2>
          <p className="text-ink-3 text-xs mt-0.5">{rc.order} #{orderId}</p>
        </div>

        {customerName && (
          <p className="text-center text-xs text-ink-2 mb-4">
            {rc.customer} <span className="text-ink font-semibold">{customerName}</span>
          </p>
        )}

        <div className="bg-canvas rounded-xl p-3 mb-4 space-y-1.5">
          {items.map((item) => (
            <div key={`${item.product_id}::${item.size}`} className="flex justify-between text-xs">
              <span className="text-ink-2 truncate mr-2">
                {item.product_name}
                {item.size !== 'One Size' && ` (${item.size})`} × {item.quantity}
              </span>
              <span className="text-ink shrink-0 font-semibold">
                ฿{(item.quantity * item.unit_price).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 mb-5 text-sm">
          <div className="flex justify-between text-ink-2">
            <span>{rc.subtotal}</span>
            <span>฿{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-ink-2">
            <span>{rc.vat}</span>
            <span>฿{vatAmount.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-coral">
              <span>{rc.discountLabel}</span>
              <span>−฿{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-ink border-t border-white/[0.06] pt-1.5">
            <span>{rc.total}</span>
            <span className="text-mint">฿{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-ink-3">
            <span>{rc.payment} ({payment.method.toUpperCase()})</span>
            <span>฿{payment.amount.toFixed(2)}</span>
          </div>
          {payment.amount > total && (
            <div className="flex justify-between text-xs text-gold font-semibold">
              <span>{rc.change}</span>
              <span>฿{(payment.amount - total).toFixed(2)}</span>
            </div>
          )}
        </div>

        <button
          onClick={onNewSale}
          className="w-full bg-mint text-canvas py-3 rounded-xl text-sm font-bold hover:bg-mint-dim transition-all"
        >
          {rc.newSale}
        </button>
      </div>
    </div>
  )
}

// ─── Main POS Content ─────────────────────────────────────────────────────────

function POSContent() {
  const { t } = useLang()
  const p = t.pos

  // Location state
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)

  // Product state
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState<string>('')
  const [note, setNote] = useState('')

  // Customer state
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false)
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false)
  const customerSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const customerDropdownRef = useRef<HTMLDivElement>(null)

  // Payment modal state
  const [showPayModal, setShowPayModal] = useState(false)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  // Receipt state
  const [receipt, setReceipt] = useState<{
    orderId: number
    payment: PaymentEntry
  } | null>(null)

  // ── Computed totals ──
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const vatAmount = Math.round(subtotal * 0.07 * 100) / 100
  const discountNum = Math.min(Math.max(parseFloat(discount) || 0, 0), subtotal + vatAmount)
  const total = Math.max(subtotal + vatAmount - discountNum, 0)

  // ── Fetch locations on mount ──
  useEffect(() => {
    apiFetch('/api/proxy/api/pos/locations')
      .then((r) => r.json())
      .then((data: Location[]) => {
        const list = data ?? []
        setLocations(list)
        if (list.length > 0) setSelectedLocation(list[0].id)
      })
      .catch(() => {})
  }, [])

  // ── Fetch products when location or search changes ──
  const fetchProducts = useCallback(
    async (q: string, locationId: number | null) => {
      if (!locationId) return
      setProductsLoading(true)
      try {
        const params = new URLSearchParams({ q, store_id: String(locationId) })
        const res = await apiFetch(`/api/proxy/api/pos/products?${params}`)
        if (res.ok) {
          const data: Product[] = await res.json()
          setProducts(data ?? [])
        }
      } finally {
        setProductsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (selectedLocation) fetchProducts('', selectedLocation)
  }, [selectedLocation, fetchProducts])

  // ── Debounced product search ──
  function handleProductSearchChange(value: string) {
    setProductSearch(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      fetchProducts(value, selectedLocation)
    }, 400)
  }

  // ── Close customer dropdown on outside click ──
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(e.target as Node)
      ) {
        setCustomerDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ── Debounced customer search ──
  function handleCustomerSearchChange(value: string) {
    setCustomerSearch(value)
    setSelectedCustomer(null)
    if (!value.trim()) {
      setCustomers([])
      setCustomerDropdownOpen(false)
      return
    }
    if (customerSearchDebounceRef.current) clearTimeout(customerSearchDebounceRef.current)
    setCustomerSearchLoading(true)
    customerSearchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await apiFetch(
          `/api/proxy/api/pos/customers?q=${encodeURIComponent(value.trim())}`
        )
        if (res.ok) {
          const data: Customer[] = await res.json()
          setCustomers(data ?? [])
          setCustomerDropdownOpen(true)
        }
      } finally {
        setCustomerSearchLoading(false)
      }
    }, 400)
  }

  // ── Cart operations ──
  function addToCart(product: Product, size: ProductSize) {
    const key = `${product.product_id}::${size.size}`
    setCart((prev) => {
      const existing = prev.find((i) => `${i.product_id}::${i.size}` === key)
      if (existing) {
        if (existing.quantity >= existing.max_quantity) return prev
        return prev.map((i) =>
          `${i.product_id}::${i.size}` === key ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [
        ...prev,
        {
          product_id: product.product_id,
          product_name: product.product_name,
          size: size.size,
          quantity: 1,
          unit_price: product.unit_price,
          max_quantity: size.quantity,
        },
      ]
    })
  }

  function changeQty(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => {
          if (`${i.product_id}::${i.size}` !== key) return i
          const newQty = i.quantity + delta
          if (newQty < 1) return null
          if (newQty > i.max_quantity) return i
          return { ...i, quantity: newQty }
        })
        .filter(Boolean) as CartItem[]
    )
  }

  function removeItem(key: string) {
    setCart((prev) => prev.filter((i) => `${i.product_id}::${i.size}` !== key))
  }

  // ── Payment flow ──
  async function handlePayConfirm(payment: PaymentEntry) {
    if (cart.length === 0) return
    setPaying(true)
    setPayError(null)

    try {
      // 1. Create order
      const orderRes = await apiFetch('/api/proxy/api/pos/orders', {
        method: 'POST',
        body: JSON.stringify({
          store_id: selectedLocation,
          customer_id: selectedCustomer?.id ?? 0,
          items: cart.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            size: item.size,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
          discount: discountNum,
          note: note.trim(),
        }),
      })

      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}))
        throw new Error(err?.error ?? 'Failed to create order')
      }

      const order = await orderRes.json()
      const orderId: number = order.id

      // 2. Pay
      const payRes = await apiFetch(`/api/proxy/api/pos/orders/${orderId}/pay`, {
        method: 'PUT',
        body: JSON.stringify({
          payments: [
            {
              method: payment.method,
              amount: payment.amount,
              reference: payment.reference,
            },
          ],
        }),
      })

      if (!payRes.ok) {
        const err = await payRes.json().catch(() => ({}))
        throw new Error(err?.error ?? 'Payment failed')
      }

      setShowPayModal(false)
      setReceipt({ orderId, payment })
    } catch (err) {
      setPayError((err as Error).message)
    } finally {
      setPaying(false)
    }
  }

  // ── Reset for new sale ──
  function handleNewSale() {
    setReceipt(null)
    setCart([])
    setDiscount('')
    setNote('')
    setSelectedCustomer(null)
    setCustomerSearch('')
    setPayError(null)
  }

  // ─── Render ───

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden -mx-4 -my-8">
      {/* ── Left panel: product browser ── */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-white/[0.06] overflow-hidden">
        {/* Top bar */}
        <div className="shrink-0 px-4 pt-4 pb-3 border-b border-white/[0.06] space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-base font-bold text-ink">{p.title}</h1>
            <div className="ml-auto flex items-center gap-2">
              {/* Location selector */}
              {locations.length > 1 && (
                <select
                  value={selectedLocation ?? ''}
                  onChange={(e) => setSelectedLocation(parseInt(e.target.value))}
                  className="bg-card-bright border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-mint/30 transition-all"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              )}
              {locations.length === 1 && (
                <span className="text-xs text-ink-2 bg-card-bright px-3 py-1.5 rounded-lg border border-white/[0.08]">
                  {locations[0]?.name}
                </span>
              )}
            </div>
          </div>

          {/* Product search */}
          <input
            type="text"
            value={productSearch}
            onChange={(e) => handleProductSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
                fetchProducts(productSearch, selectedLocation)
              }
            }}
            placeholder={p.searchProducts}
            className="w-full bg-canvas border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-mint/30 focus:ring-1 focus:ring-mint/10 transition-all"
          />
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {productsLoading ? (
            <Spinner />
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-ink-3">
              <p className="text-3xl mb-2 opacity-20">□</p>
              <p className="text-sm">{p.noProducts}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {products.map((product) => (
                <ProductCard key={product.product_id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel: order summary ── */}
      <div className="w-80 xl:w-96 shrink-0 flex flex-col overflow-hidden bg-card">
        {/* Header */}
        <div className="shrink-0 px-4 pt-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-bold text-ink uppercase tracking-wider">
              {p.orderSummary}
            </h2>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-ink-3 hover:text-coral transition-colors"
              >
                {p.clearAll}
              </button>
            )}
          </div>
        </div>

        {/* Cart items (scrollable) */}
        <div className="flex-1 overflow-y-auto px-4">
          {cart.length === 0 ? (
            <div className="text-center py-10 text-ink-3">
              <p className="text-3xl mb-2 opacity-20">🛒</p>
              <p className="text-xs">{p.cartEmpty}</p>
              <p className="text-xs opacity-60 mt-0.5">{p.cartEmptySub}</p>
            </div>
          ) : (
            <div className="py-2">
              {cart.map((item) => (
                <CartRow
                  key={`${item.product_id}::${item.size}`}
                  item={item}
                  onQtyChange={changeQty}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom section */}
        <div className="shrink-0 border-t border-white/[0.06] px-4 pt-3 pb-4 space-y-3">
          {/* Customer */}
          <div ref={customerDropdownRef} className="relative">
            <label className="block text-xs text-ink-3 font-semibold uppercase tracking-wider mb-1.5">
              {p.customer}
            </label>
            {selectedCustomer ? (
              <div className="flex items-center justify-between bg-card-bright border border-mint/20 rounded-xl px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-ink">{selectedCustomer.name}</p>
                  <p className="text-xs text-ink-3">{selectedCustomer.email}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCustomer(null)
                    setCustomerSearch('')
                  }}
                  className="text-ink-3 hover:text-coral text-lg leading-none transition-colors"
                >
                  ×
                </button>
              </div>
            ) : (
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => handleCustomerSearchChange(e.target.value)}
                placeholder={p.searchCustomer}
                className="w-full bg-canvas border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-mint/30 focus:ring-1 focus:ring-mint/10 transition-all"
              />
            )}

            {customerDropdownOpen && customers.length > 0 && !selectedCustomer && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-card-bright border border-white/[0.1] rounded-xl shadow-xl z-20 overflow-hidden max-h-48 overflow-y-auto">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c)
                      setCustomerDropdownOpen(false)
                      setCustomers([])
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-white/[0.04] transition-colors border-b border-white/[0.04] last:border-0"
                  >
                    <p className="text-sm text-ink font-medium">{c.name}</p>
                    <p className="text-xs text-ink-3">{c.email}</p>
                  </button>
                ))}
                <button
                  onClick={() => {
                    setCustomerDropdownOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-ink-3 hover:text-ink hover:bg-white/[0.04] transition-colors"
                >
                  {p.walkIn}
                </button>
              </div>
            )}

            {customerSearchLoading && (
              <p className="text-xs text-ink-3 mt-1">{p.searching}</p>
            )}
          </div>

          {/* Discount */}
          <div>
            <label className="block text-xs text-ink-3 font-semibold uppercase tracking-wider mb-1.5">
              {p.discount}
            </label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              min={0}
              max={subtotal}
              placeholder="0.00"
              className="w-full bg-canvas border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-mint/30 focus:ring-1 focus:ring-mint/10 transition-all"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs text-ink-3 font-semibold uppercase tracking-wider mb-1.5">
              {p.note}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={p.notePlaceholder}
              className="w-full bg-canvas border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-mint/30 focus:ring-1 focus:ring-mint/10 transition-all"
            />
          </div>

          {/* Totals */}
          <div className="bg-canvas rounded-xl px-3 py-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-ink-2">
              <span>{p.subtotal}</span>
              <span>฿{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-ink-2">
              <span>{p.vat}</span>
              <span>฿{vatAmount.toFixed(2)}</span>
            </div>
            {discountNum > 0 && (
              <div className="flex justify-between text-coral">
                <span>{p.discountLabel}</span>
                <span>−฿{discountNum.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-ink border-t border-white/[0.06] pt-2">
              <span>{p.total}</span>
              <span className="text-mint">฿{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Pay error */}
          {payError && (
            <div className="rounded-xl border border-coral/20 bg-coral/5 px-3 py-2 text-xs text-coral">
              {payError}
            </div>
          )}

          {/* PAY button */}
          <button
            disabled={cart.length === 0}
            onClick={() => {
              setPayError(null)
              setShowPayModal(true)
            }}
            className="w-full bg-mint text-canvas py-3.5 rounded-xl text-base font-bold hover:bg-mint-dim disabled:opacity-30 disabled:cursor-not-allowed transition-all tracking-wide"
          >
            {p.pay} ฿{total.toFixed(2)}
          </button>
        </div>
      </div>

      {/* ── Payment Modal ── */}
      {showPayModal && (
        <PaymentModal
          total={total}
          onConfirm={handlePayConfirm}
          onClose={() => setShowPayModal(false)}
          paying={paying}
        />
      )}

      {/* ── Receipt Screen ── */}
      {receipt && (
        <ReceiptScreen
          orderId={receipt.orderId}
          items={cart}
          subtotal={subtotal}
          vatAmount={vatAmount}
          discount={discountNum}
          total={total}
          payment={receipt.payment}
          customerName={selectedCustomer?.name ?? ''}
          onNewSale={handleNewSale}
        />
      )}
    </div>
  )
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function POSPage() {
  return (
    <AuthGuard>
      <POSContent />
    </AuthGuard>
  )
}
