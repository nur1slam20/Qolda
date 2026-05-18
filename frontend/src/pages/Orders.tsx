import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { XCircle, Package, Truck, CheckCircle2, Clock, RotateCcw, ShoppingCart } from 'lucide-react'
import type { Order, OrderStatusHistory } from '../api/types'
import { ordersApi } from '../api/orders'
import { useUserStore } from '../store/userStore'
import { useCartStore } from '../store/cartStore'
import { toast } from '../store/toastStore'
import { confirm } from '../components/ConfirmDialog'
import ProductImage from '../components/ProductImage'

const STEPS = [
  { key: 'processing', label: 'Принят',    icon: Clock },
  { key: 'shipped',    label: 'В пути',    icon: Truck },
  { key: 'completed',  label: 'Доставлен', icon: CheckCircle2 },
]

const STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  pending:    { label: 'Ожидает',     color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  processing: { label: 'В обработке', color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500'   },
  shipped:    { label: 'В пути',      color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  completed:  { label: 'Доставлен',  color: 'bg-green-100 text-green-700',   dot: 'bg-green-500'  },
  cancelled:  { label: 'Отменён',    color: 'bg-red-100 text-red-600',       dot: 'bg-red-500'    },
  returned:   { label: 'Возврат',    color: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400'   },
}

const FILTER_TABS = [
  { key: 'all',        label: 'Все' },
  { key: 'active',     label: 'Активные' },
  { key: 'completed',  label: 'Доставлен' },
  { key: 'cancelled',  label: 'Отменён' },
]

function matchFilter(status: string, filter: string) {
  if (filter === 'all')       return true
  if (filter === 'active')    return ['pending', 'processing', 'shipped'].includes(status)
  if (filter === 'completed') return status === 'completed'
  if (filter === 'cancelled') return status === 'cancelled' || status === 'returned'
  return false
}

function fmt(n: number) { return n.toLocaleString('ru-KZ') + ' ₸' }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function OrderProgress({ status }: { status: string }) {
  if (status === 'cancelled' || status === 'returned') {
    const isCancelled = status === 'cancelled'
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${isCancelled ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
        {isCancelled ? <XCircle size={16} /> : <RotateCcw size={16} />}
        {isCancelled ? 'Заказ отменён' : 'Оформлен возврат'}
      </div>
    )
  }

  const currentIdx = STEPS.findIndex(s => s.key === status)
  const activeIdx  = currentIdx === -1 ? 0 : currentIdx

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const Icon    = step.icon
        const done    = idx < activeIdx
        const current = idx === activeIdx
        const isLast  = idx === STEPS.length - 1
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                done    ? 'bg-[#004B57] text-white' :
                current ? 'bg-[#004B57] text-white ring-4 ring-[#004B57]/20' :
                          'bg-gray-100 text-gray-400'
              }`}>
                <Icon size={15} />
              </div>
              <span className={`text-xs font-medium ${current ? 'text-[#004B57]' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`w-12 sm:w-20 h-0.5 mb-4 mx-1 transition-colors ${idx < activeIdx ? 'bg-[#004B57]' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Orders() {
  const user     = useUserStore(s => s.user)
  const addItem  = useCartStore(s => s.addItem)
  const navigate = useNavigate()

  const [orders, setOrders]       = useState<Order[]>([])
  const [loading, setLoading]     = useState(true)
  const [expanded, setExpanded]   = useState<number | null>(null)
  const [histories, setHistories] = useState<Record<number, OrderStatusHistory[]>>({})
  const [filter, setFilter]       = useState('all')
  const [reordering, setReordering] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    ordersApi.getUserOrders(user.id)
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [user])

  const handleCancel = async (orderId: number) => {
    if (!await confirm('Тапсырысты бас тарту / Отменить заказ? Это действие нельзя отменить.')) return
    try {
      const updated = await ordersApi.cancelOrder(orderId)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o))
      toast.success('Тапсырыс бас тартылды / Заказ отменён')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg || 'Бас тарту мүмкін болмады / Не удалось отменить')
    }
  }

  const handleReturn = async (orderId: number) => {
    if (!await confirm('Тауарды қайтару / Вернуть товар? Менеджер свяжется с вами для уточнения деталей.')) return
    try {
      const updated = await ordersApi.returnOrder(orderId)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o))
      toast.success('Қайтару сұратылды / Запрос на возврат отправлен')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg || 'Қайтару мүмкін болмады / Не удалось оформить возврат')
    }
  }

  const handleReorder = async (order: Order) => {
    if (!order.items.length) return
    setReordering(order.id)
    try {
      for (const item of order.items) {
        if (item.product) {
          await addItem(item.product, item.quantity)
        }
      }
      toast.success('Тауарлар себетке қосылды / Товары добавлены в корзину')
      navigate('/cart')
    } catch {
      toast.error('Қайта тапсырыс беру мүмкін болмады / Не удалось повторить заказ')
    } finally {
      setReordering(null)
    }
  }

  const toggleOrder = async (orderId: number) => {
    if (expanded === orderId) { setExpanded(null); return }
    setExpanded(orderId)
    if (!histories[orderId]) {
      try {
        const h = await ordersApi.getOrderHistory(orderId)
        setHistories(prev => ({ ...prev, [orderId]: h }))
      } catch {
        setHistories(prev => ({ ...prev, [orderId]: [] }))
      }
    }
  }

  const filtered = orders.filter(o => matchFilter(o.status, filter))

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-5">
        Тапсырыстарым / <span className="text-gray-500">Мои заказы</span>
      </h1>

      {/* Filter tabs */}
      {orders.length > 0 && (
        <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1">
          {FILTER_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === t.key
                  ? 'bg-white text-[#004B57] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
              {t.key !== 'all' && (
                <span className="ml-1 text-xs opacity-60">
                  {orders.filter(o => matchFilter(o.status, t.key)).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-gray-300" />
          </div>
          {filter === 'all' ? (
            <>
              <p className="font-medium text-gray-500 mb-1">Тапсырыстар жоқ / Заказов пока нет</p>
              <p className="text-sm">Сделайте первый заказ в каталоге</p>
              <Link to="/" className="inline-block mt-4 px-5 py-2.5 bg-[#004B57] text-white font-semibold rounded-xl text-sm hover:bg-[#003840] transition-colors">
                Сатып алуға / В магазин
              </Link>
            </>
          ) : (
            <p className="text-sm text-gray-500">Нет заказов в этой категории</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
            const isExpanded = expanded === order.id
            const history    = histories[order.id] ?? []

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header row */}
                <div
                  className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 cursor-pointer hover:bg-gray-50/60 transition-colors"
                  onClick={() => toggleOrder(order.id)}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-9 h-9 bg-[#004B57]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package size={16} className="text-[#004B57]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Тапсырыс #{order.id}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
                    <span className="font-bold text-[#004B57]">{fmt(order.total_amount)}</span>

                    {/* Repeat order */}
                    {order.status === 'completed' && (
                      <button
                        onClick={e => { e.stopPropagation(); handleReorder(order) }}
                        disabled={reordering === order.id}
                        className="flex items-center gap-1 text-xs text-[#004B57] hover:text-[#003840] border border-[#004B57]/30 hover:border-[#004B57] px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <ShoppingCart size={12} />
                        {reordering === order.id ? '...' : 'Заказать снова'}
                      </button>
                    )}

                    {/* Cancel */}
                    {['pending', 'processing'].includes(order.status) && (
                      <button
                        onClick={e => { e.stopPropagation(); handleCancel(order.id) }}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <XCircle size={12} /> Отменить
                      </button>
                    )}

                    {/* Return */}
                    {order.status === 'completed' && (
                      <button
                        onClick={e => { e.stopPropagation(); handleReturn(order.id) }}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 border border-amber-200 hover:border-amber-300 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <RotateCcw size={12} /> Вернуть
                      </button>
                    )}

                    <span className="text-gray-300 text-sm">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-5 pt-4 space-y-5">

                    {/* Progress tracker */}
                    <div className="flex justify-center py-2">
                      <OrderProgress status={order.status} />
                    </div>

                    {/* Delivery info */}
                    {(order.delivery_address || order.delivery_service || order.customer_phone) && (
                      <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-sm">
                        {order.delivery_address && (
                          <p className="text-gray-600"><span className="font-medium text-gray-800">Адрес:</span> {order.delivery_address}</p>
                        )}
                        {order.delivery_service && (
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">Доставка:</span> {order.delivery_service.name}
                            {order.delivery_cost ? ` — ${fmt(order.delivery_cost)}` : ' — Бесплатно'}
                            <span className="text-gray-400 ml-1">({order.delivery_service.days_min}–{order.delivery_service.days_max} дн.)</span>
                          </p>
                        )}
                        {order.customer_phone && (
                          <p className="text-gray-600"><span className="font-medium text-gray-800">Телефон:</span> {order.customer_phone}</p>
                        )}
                      </div>
                    )}

                    {/* Status history timeline */}
                    {history.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">История изменений</p>
                        <div className="relative pl-5 space-y-0">
                          {history.map((h, idx) => {
                            const si     = STATUS_LABELS[h.status] ?? { label: h.status, dot: 'bg-gray-400' }
                            const isLast = idx === history.length - 1
                            return (
                              <div key={h.id} className="relative flex items-start gap-3 pb-3 last:pb-0">
                                {!isLast && <div className="absolute left-[-13px] top-4 bottom-0 w-px bg-gray-200" />}
                                <div className={`absolute left-[-17px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${si.dot}`} />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{si.label}</p>
                                  <p className="text-xs text-gray-400">{fmtDate(h.changed_at)}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Состав заказа</p>
                      {order.items.map(item => (
                        <div key={item.id} className="flex gap-3 items-center">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.product && (
                              <ProductImage
                                src={item.product.image_url}
                                alt={item.product.name_ru}
                                className="w-full h-full object-cover"
                                iconSize={20}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/product/${item.product_id}`}
                              className="text-sm font-medium text-gray-900 hover:text-[#004B57] transition-colors line-clamp-1"
                            >
                              {item.product?.name_ru || `Тауар #${item.product_id}`}
                            </Link>
                            <p className="text-xs text-gray-400">{item.quantity} шт. × {fmt(item.price)}</p>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                            {fmt(item.quantity * item.price)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-sm text-gray-500">Итого с доставкой</span>
                      <span className="font-bold text-[#004B57] text-lg">{fmt(order.total_amount)}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
