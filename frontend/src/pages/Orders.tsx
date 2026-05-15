import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { XCircle } from 'lucide-react'
import type { Order, OrderStatusHistory } from '../api/types'
import { ordersApi } from '../api/orders'
import { useUserStore } from '../store/userStore'
import { toast } from '../store/toastStore'
import { confirm } from '../components/ConfirmDialog'
import ProductImage from '../components/ProductImage'

const STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  pending:    { label: 'Ожидает',      color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  processing: { label: 'В обработке',  color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500'   },
  shipped:    { label: 'В пути',       color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  completed:  { label: 'Доставлен',   color: 'bg-green-100 text-green-700',   dot: 'bg-green-500'  },
  cancelled:  { label: 'Отменён',     color: 'bg-red-100 text-red-600',       dot: 'bg-red-500'    },
  returned:   { label: 'Возврат',     color: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400'   },
}

function formatPrice(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Orders() {
  const user = useUserStore(s => s.user)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [histories, setHistories] = useState<Record<number, OrderStatusHistory[]>>({})

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

  const toggleOrder = async (orderId: number) => {
    if (expanded === orderId) {
      setExpanded(null)
      return
    }
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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card h-24 animate-pulse mb-4" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Тапсырыстарым / <span className="text-gray-500">Мои заказы</span>
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📦</div>
          <p>Тапсырыстар жоқ / Заказов пока нет</p>
          <Link to="/" className="btn-primary inline-block mt-4">Сатып алуға / В магазин</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
            const isExpanded = expanded === order.id
            const history = histories[order.id] ?? []

            return (
              <div key={order.id} className="card">
                <div
                  className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 cursor-pointer hover:bg-gray-50 rounded-xl"
                  onClick={() => toggleOrder(order.id)}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-gray-900">Тапсырыс #{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="font-bold text-[#004B57]">{formatPrice(order.total_amount)}</span>
                    {['pending', 'processing'].includes(order.status) && (
                      <button
                        onClick={e => { e.stopPropagation(); handleCancel(order.id) }}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <XCircle size={12} /> Отменить
                      </button>
                    )}
                    <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-4">
                    {order.delivery_address && (
                      <p className="text-sm text-gray-500">📍 {order.delivery_address}</p>
                    )}

                    {/* Status timeline */}
                    {history.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                          История статусов
                        </p>
                        <div className="relative pl-5">
                          {history.map((h, idx) => {
                            const si = STATUS_LABELS[h.status] ?? { label: h.status, dot: 'bg-gray-400' }
                            const isLast = idx === history.length - 1
                            return (
                              <div key={h.id} className="relative flex items-start gap-3 pb-4 last:pb-0">
                                {!isLast && (
                                  <div className="absolute left-[-13px] top-4 bottom-0 w-px bg-gray-200" />
                                )}
                                <div
                                  className={`absolute left-[-17px] top-1 w-2.5 h-2.5 rounded-full flex-shrink-0 border-2 border-white ${si.dot}`}
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{si.label}</p>
                                  <p className="text-xs text-gray-400">{formatDateTime(h.changed_at)}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Order items */}
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div key={item.id} className="flex gap-3 text-sm items-center">
                          {item.product && (
                            <ProductImage
                              src={item.product.image_url}
                              alt={item.product.name_ru}
                              className="w-12 h-12 rounded-lg object-cover"
                              iconSize={20}
                            />
                          )}
                          <div className="flex-1">
                            <Link to={`/product/${item.product_id}`} className="font-medium hover:text-[#004B57] transition-colors">
                              {item.product?.name_ru || `Тауар #${item.product_id}`}
                            </Link>
                            <p className="text-gray-500">{item.quantity} дана × {formatPrice(item.price)}</p>
                          </div>
                          <span className="font-semibold">{formatPrice(item.quantity * item.price)}</span>
                        </div>
                      ))}
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
