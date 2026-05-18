import { useEffect, useRef, useState } from 'react'
import { Search, Download, ChevronDown, X, Package, MapPin, Phone, Mail, User } from 'lucide-react'
import { ordersApi } from '../../api/orders'
import type { SellerOrder } from '../../api/types'
import { exportCsv } from '../../utils/exportCsv'
import { toast } from '../../store/toastStore'
import ProductImage from '../../components/ProductImage'

function fmt(n: number) { return n.toLocaleString('ru-KZ') + ' ₸' }

function fmtDate(iso: string) {
  const d = new Date(iso)
  const isToday = d.toDateString() === new Date().toDateString()
  const time = d.toLocaleTimeString('ru-KZ', { hour: '2-digit', minute: '2-digit' })
  return isToday
    ? `Сегодня, ${time}`
    : d.toLocaleDateString('ru-KZ', { day: '2-digit', month: 'short' }) + `, ${time}`
}

const TABS = [
  { key: 'all',       label: 'Все заказы'  },
  { key: 'pending',   label: 'В ожидании'  },
  { key: 'shipped',   label: 'Отгружено'   },
  { key: 'completed', label: 'Доставлено'  },
  { key: 'cancelled', label: 'Возвраты'    },
]

const ST: Record<string, { dot: string; label: string }> = {
  processing: { dot: 'bg-blue-400',   label: 'В обработке' },
  pending:    { dot: 'bg-amber-400',  label: 'В ожидании'  },
  shipped:    { dot: 'bg-purple-400', label: 'Отгружено'   },
  completed:  { dot: 'bg-green-500',  label: 'Доставлено'  },
  cancelled:  { dot: 'bg-red-400',    label: 'Возврат'     },
  returned:   { dot: 'bg-gray-400',   label: 'Возврат'     },
}

function matchTab(status: string, tab: string) {
  if (tab === 'all')       return true
  if (tab === 'pending')   return status === 'pending' || status === 'processing'
  if (tab === 'shipped')   return status === 'shipped'
  if (tab === 'completed') return status === 'completed'
  if (tab === 'cancelled') return status === 'cancelled' || status === 'returned'
  return false
}

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: 'processing', label: 'В обработке' },
  { value: 'pending',    label: 'В ожидании'  },
  { value: 'shipped',    label: 'Отгружено'   },
  { value: 'completed',  label: 'Доставлено'  },
  { value: 'cancelled',  label: 'Отменён'     },
]

function StatusDropdown({ order, onUpdate }: { order: SellerOrder; onUpdate: (o: SellerOrder) => void }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const ref             = useRef<HTMLDivElement>(null)
  const st              = ST[order.status] ?? { dot: 'bg-gray-400', label: order.status }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const change = async (status: string) => {
    if (status === order.status) { setOpen(false); return }
    setBusy(true)
    try {
      const updated = await ordersApi.updateStatus(order.id, status)
      onUpdate(updated)
      toast.success('Статус заказа обновлён')
    } catch { /* ignore */ }
    finally { setBusy(false); setOpen(false) }
  }

  return (
    <div ref={ref} className="relative inline-block" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={busy}
        className="flex items-center gap-1.5 text-sm text-gray-700 font-medium hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
        {st.label}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 left-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => change(opt.value)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                opt.value === order.status ? 'font-semibold text-[#004B57]' : 'text-gray-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${ST[opt.value]?.dot ?? 'bg-gray-400'}`} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function OrderDrawer({ order, onClose, onUpdate }: {
  order: SellerOrder
  onClose: () => void
  onUpdate: (o: SellerOrder) => void
}) {
  const name = order.customer_name || order.buyer_name

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-30 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-40 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-bold text-gray-900 text-lg">#ORD-{order.id}</p>
            <p className="text-xs text-gray-400">{fmtDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusDropdown order={order} onUpdate={onUpdate} />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Customer info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Покупатель</p>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#004B57]/10 text-[#004B57] flex items-center justify-center text-sm font-bold flex-shrink-0">
                {name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{name}</p>
                <p className="text-xs text-gray-400">{order.buyer_email}</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              {order.customer_phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={13} className="text-gray-400 flex-shrink-0" />
                  {order.customer_phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={13} className="text-gray-400 flex-shrink-0" />
                {order.buyer_email}
              </div>
              {order.delivery_address && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  {order.delivery_address}
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Состав заказа · {order.items.length} поз.
            </p>
            <div className="space-y-3">
              {order.items.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Нет данных о товарах</p>
              ) : order.items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.product && (
                      <ProductImage
                        src={item.product.image_url}
                        alt={item.product.name_ru}
                        className="w-full h-full object-cover"
                        iconSize={18}
                      />
                    )}
                    {!item.product && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={18} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {item.product?.name_ru || `Товар #${item.product_id}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.quantity} шт. × {fmt(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    {fmt(item.quantity * item.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total breakdown */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Товары ({order.items.reduce((s, i) => s + i.quantity, 0)} шт.)</span>
              <span>{fmt(order.items.reduce((s, i) => s + i.price * i.quantity, 0))}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
              <span>Итого</span>
              <span className="text-[#004B57]">{fmt(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function SellerOrders() {
  const [orders, setOrders]       = useState<SellerOrder[]>([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState('all')
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const [selected, setSelected]   = useState<SellerOrder | null>(null)

  const handleUpdate = (updated: SellerOrder) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
    setSelected(prev => prev?.id === updated.id ? updated : prev)
  }

  const handleExport = () => {
    exportCsv(`orders_${new Date().toISOString().slice(0, 10)}.csv`,
      ['ID', 'Клиент', 'Email', 'Телефон', 'Статус', 'Сумма', 'Дата'],
      orders.map(o => [
        `#ORD-${o.id}`,
        o.customer_name || o.buyer_name,
        o.buyer_email,
        o.customer_phone ?? '',
        ST[o.status]?.label ?? o.status,
        o.total_amount,
        new Date(o.created_at).toLocaleDateString('ru-RU'),
      ])
    )
    toast.success('CSV-файл скачан')
  }

  useEffect(() => {
    ordersApi.getSellerOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const todayCount   = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length
  const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length
  const revenue      = orders.reduce((s, o) => s + o.total_amount, 0)
  const conversion   = orders.length > 0
    ? ((orders.filter(o => o.status === 'completed').length / orders.length) * 100).toFixed(1)
    : '0.0'

  const filtered = orders.filter(o => {
    if (!matchTab(o.status, tab)) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        String(o.id).includes(q) ||
        (o.customer_name ?? '').toLowerCase().includes(q) ||
        o.buyer_name.toLowerCase().includes(q) ||
        o.buyer_email.toLowerCase().includes(q)
      )
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      {/* Drawer */}
      {selected && (
        <OrderDrawer
          order={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление заказами</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Нажмите на строку для просмотра деталей заказа
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-[#004B57] hover:bg-[#003840] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Download size={14} /> Экспорт CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Всего сегодня',  value: todayCount,       warn: false },
          { label: 'Ожидают сборки', value: pendingCount,     warn: pendingCount > 0 },
          { label: 'Выручка (₸)',    value: fmt(revenue),     warn: false },
          { label: 'Конверсия',      value: conversion + '%', warn: false },
        ].map(({ label, value, warn }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${warn ? 'text-amber-500' : 'text-gray-900'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs + search */}
        <div className="flex items-center border-b border-gray-100 px-4 overflow-x-auto">
          <div className="flex flex-shrink-0">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setPage(1) }}
                className={`py-3.5 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-[#004B57] text-[#004B57]'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                {t.label}
                {t.key !== 'all' && (
                  <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">
                    {orders.filter(o => matchTab(o.status, t.key)).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 py-2 flex-shrink-0 pl-4">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Поиск по ID или клиенту"
                className="pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B57]/20 w-48"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {search ? 'По вашему запросу ничего не найдено' : 'Заказов пока нет'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-3 px-5 py-2.5 bg-gray-50/70 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <div className="col-span-2">ID заказа</div>
              <div className="col-span-4">Клиент</div>
              <div className="col-span-2">Дата</div>
              <div className="col-span-3">Статус</div>
              <div className="col-span-1">Сумма</div>
            </div>

            <div className="divide-y divide-gray-50">
              {paginated.map(order => {
                const name     = order.customer_name || order.buyer_name
                const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelected(order)}
                    className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-gray-50/70 transition-colors cursor-pointer"
                  >
                    <div className="col-span-2">
                      <span className="font-mono text-sm font-semibold text-gray-800">#ORD-{order.id}</span>
                    </div>

                    <div className="col-span-4 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#004B57]/10 text-[#004B57] flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                        {order.customer_phone && (
                          <p className="text-xs text-gray-400 truncate">{order.customer_phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 text-xs text-gray-500">{fmtDate(order.created_at)}</div>

                    <div className="col-span-3">
                      <StatusDropdown order={order} onUpdate={handleUpdate} />
                    </div>

                    <div className="col-span-1 text-sm font-semibold text-gray-900">{fmt(order.total_amount)}</div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Показано {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} из {filtered.length} заказов
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-xs text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >‹</button>
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                      page === n ? 'bg-[#004B57] text-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >{n}</button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-xs text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >›</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
