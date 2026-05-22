import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { XCircle, Package, Truck, CheckCircle, Clock, ArchiveX, MessageCircle } from 'lucide-react'
import type { Order, OrderStatusHistory } from '../api/types'
import { ordersApi } from '../api/orders'
import { useUserStore } from '../store/userStore'
import { toast } from '../store/toastStore'
import { confirm } from '../components/ConfirmDialog'
import ProductImage from '../components/ProductImage'

const STEPS = ['pending', 'processing', 'shipped', 'completed']

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string; icon: React.ElementType }> = {
  pending:    { label: 'Ожидает',      color: 'text-yellow-600', bg: 'bg-yellow-100', dot: 'bg-yellow-400', icon: Clock       },
  processing: { label: 'В обработке',  color: 'text-blue-600',   bg: 'bg-blue-100',   dot: 'bg-blue-500',   icon: Package     },
  shipped:    { label: 'В пути',       color: 'text-purple-600', bg: 'bg-purple-100', dot: 'bg-purple-500', icon: Truck       },
  completed:  { label: 'Доставлен',   color: 'text-green-600',  bg: 'bg-green-100',  dot: 'bg-green-500',  icon: CheckCircle },
  cancelled:  { label: 'Отменён',     color: 'text-red-600',    bg: 'bg-red-100',    dot: 'bg-red-500',    icon: XCircle     },
  returned:   { label: 'Возврат',     color: 'text-gray-500',   bg: 'bg-gray-100',   dot: 'bg-gray-400',   icon: ArchiveX    },
}

function formatPrice(n: number) { return n.toLocaleString('ru-KZ') + ' ₸' }
function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ProgressBar({ status }: { status: string }) {
  const step = STEPS.indexOf(status)
  if (step === -1) return null
  return (
    <div className="flex items-center gap-0 mb-4">
      {STEPS.map((s, i) => {
        const meta = STATUS_META[s]
        const done = i <= step
        const Icon = meta.icon
        return (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex flex-col items-center gap-1 flex-shrink-0`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                done ? 'bg-[#004B57] border-[#004B57] text-white' : 'bg-white border-gray-200 text-gray-300'
              }`}>
                <Icon size={14} />
              </div>
              <span className={`text-[10px] font-medium ${done ? 'text-[#004B57]' : 'text-gray-300'}`}>
                {meta.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 transition-all ${i < step ? 'bg-[#004B57]' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function OrderCard({ order, onCancel }: { order: Order; onCancel: (id: number) => void }) {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<OrderStatusHistory[]>([])
  const meta = STATUS_META[order.status] ?? STATUS_META.pending
  const Icon = meta.icon
  const isActive = ['pending', 'processing', 'shipped'].includes(order.status)

  const toggle = async () => {
    setOpen(o => !o)
    if (!open && history.length === 0) {
      try { const h = await ordersApi.getOrderHistory(order.id); setHistory(h) } catch {}
    }
  }

  return (
    <div className={`card overflow-hidden transition-all duration-200 ${open ? 'shadow-md' : 'hover:shadow-sm'}`}>
      {/* Header */}
      <div className="p-4 cursor-pointer" onClick={toggle}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.bg}`}>
              <Icon size={18} className={meta.color} />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Заказ #{order.id}</p>
              <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="font-black text-[#004B57] dark:text-teal-400">{formatPrice(order.total_amount)}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                {meta.label}
              </span>
            </div>
            <span className="text-gray-300 text-sm">{open ? '▲' : '▼'}</span>
          </div>
        </div>

        {/* Quick items preview */}
        {!open && (
          <div className="flex items-center gap-2 mt-3">
            {order.items.slice(0, 4).map(item => (
              <ProductImage
                key={item.id}
                src={item.product?.image_url}
                alt={item.product?.name_ru ?? ''}
                className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                iconSize={14}
              />
            ))}
            {order.items.length > 4 && (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-semibold">
                +{order.items.length - 4}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded */}
      {open && (
        <div className="border-t dark:border-gray-800 px-4 pb-5 pt-4 space-y-5">
          {/* Progress bar */}
          {isActive && <ProgressBar status={order.status} />}

          {/* Delivery info */}
          {order.delivery_address && (
            <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm">
              <span className="text-lg">📍</span>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Адрес доставки</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{order.delivery_address}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          {history.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">История</p>
              <div className="relative pl-5 space-y-3">
                {history.map((h, i) => {
                  const hm = STATUS_META[h.status] ?? STATUS_META.pending
                  return (
                    <div key={h.id} className="relative flex items-start gap-3">
                      {i < history.length - 1 && <div className="absolute left-[-13px] top-4 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />}
                      <div className={`absolute left-[-17px] top-1.5 w-2.5 h-2.5 rounded-full ${hm.dot} border-2 border-white dark:border-gray-900`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{hm.label}</p>
                        <p className="text-xs text-gray-400">{formatDate(h.changed_at)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Товары</p>
            {order.items.map(item => (
              <div key={item.id} className="flex gap-3 items-center">
                <ProductImage
                  src={item.product?.image_url} alt={item.product?.name_ru ?? ''}
                  className="w-14 h-14 rounded-xl object-cover border border-gray-100 dark:border-gray-700 flex-shrink-0"
                  iconSize={18}
                />
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product_id}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-[#004B57] dark:hover:text-teal-400 line-clamp-1">
                    {item.product?.name_ru ?? `Товар #${item.product_id}`}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{item.quantity} шт × {formatPrice(item.price)}</p>
                </div>
                <p className="font-bold text-gray-800 dark:text-white flex-shrink-0">{formatPrice(item.quantity * item.price)}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap pt-1">
            {['pending', 'processing'].includes(order.status) && (
              <button
                onClick={() => onCancel(order.id)}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                <XCircle size={14} /> Отменить заказ
              </button>
            )}
            <Link
              to="/chat"
              className="flex items-center gap-1.5 text-sm text-[#004B57] dark:text-teal-400 border border-[#004B57]/30 px-3 py-1.5 rounded-lg hover:bg-[#004B57]/5 transition-colors"
            >
              <MessageCircle size={14} /> Написать продавцу
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Orders() {
  const user = useUserStore(s => s.user)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'active' | 'archive'>('active')

  useEffect(() => {
    if (!user) return
    ordersApi.getUserOrders(user.id).then(setOrders).finally(() => setLoading(false))
  }, [user])

  const handleCancel = async (orderId: number) => {
    if (!await confirm('Отменить заказ? Это действие нельзя отменить.')) return
    try {
      const updated = await ordersApi.cancelOrder(orderId)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o))
      toast.success('Заказ отменён')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg || 'Не удалось отменить')
    }
  }

  const active  = orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status))
  const archive = orders.filter(o => ['completed', 'cancelled', 'returned'].includes(o.status))
  const shown   = tab === 'active' ? active : archive

  const TABS = [
    { key: 'active',  label: 'Активные',  count: active.length,  color: 'text-blue-600'  },
    { key: 'archive', label: 'Архив',     count: archive.length, color: 'text-gray-500'  },
  ] as const

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Мои заказы</h1>
          <p className="text-sm text-gray-400 mt-0.5">Тапсырыстарым</p>
        </div>
        <Link to="/chat" className="flex items-center gap-2 bg-[#004B57] hover:bg-[#003840] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <MessageCircle size={15} /> Чат с продавцом
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Всего заказов', value: orders.length, color: 'text-gray-900 dark:text-white' },
          { label: 'Активных',      value: active.length,  color: 'text-blue-600' },
          { label: 'Выполнено',     value: archive.filter(o => o.status === 'completed').length, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-5">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key
                ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                tab === t.key ? 'bg-[#004B57] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 card animate-pulse" />)}
        </div>
      ) : shown.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">{tab === 'active' ? '📦' : '🗂️'}</div>
          <p className="text-gray-400 font-medium">
            {tab === 'active' ? 'Активных заказов нет' : 'Архив пуст'}
          </p>
          <Link to="/" className="btn-primary inline-block mt-4 text-sm">В магазин →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map(o => <OrderCard key={o.id} order={o} onCancel={handleCancel} />)}
        </div>
      )}
    </div>
  )
}
