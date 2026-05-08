import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ordersApi } from '../../api/orders'
import type { SellerOrder } from '../../api/types'

function formatPrice(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-KZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Күтуде / Ожидание', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Өңделуде / В обработке', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Аяқталды / Выполнен', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Бас тартылды / Отменён', color: 'bg-red-100 text-red-700' },
}

export default function SellerOrders() {
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    ordersApi.getSellerOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id: number) =>
    setExpandedId(prev => (prev === id ? null : id))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/seller/dashboard" className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&larr;</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Тапсырыстар</h1>
          <p className="text-gray-500 text-sm">Заказы покупателей</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse space-y-2">
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-gray-500">
            Тапсырыстар жоқ / Заказов пока нет
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Тауарларыңызды каталогта клиенттер табуы үшін жарияланғанын тексеріңіз.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const status = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-700' }
            const isExpanded = expandedId === order.id

            return (
              <div key={order.id} className="card overflow-hidden">
                {/* Order header — always visible */}
                <button
                  onClick={() => toggle(order.id)}
                  className="w-full text-left p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">
                          Тапсырыс №{order.id}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{formatPrice(order.total_amount)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{isExpanded ? '▲ жабу' : '▼ толығырақ'}</p>
                    </div>
                  </div>

                  {/* Customer info — always visible */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div>
                      <span className="text-gray-400">Клиент: </span>
                      <span className="font-medium text-gray-700">
                        {order.customer_name || order.buyer_name}
                      </span>
                    </div>
                    {order.customer_phone && (
                      <div>
                        <span className="text-gray-400">Телефон: </span>
                        <a
                          href={`tel:${order.customer_phone}`}
                          onClick={e => e.stopPropagation()}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {order.customer_phone}
                        </a>
                      </div>
                    )}
                    {order.delivery_address && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-400">Мекенжай: </span>
                        <span className="text-gray-700">{order.delivery_address}</span>
                      </div>
                    )}
                  </div>
                </button>

                {/* Expanded items */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      Тауарлар / Товары
                    </p>
                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm gap-3">
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-gray-800">
                              {item.product?.name_ru ?? `Тауар #${item.product_id}`}
                            </span>
                            <span className="text-gray-400 ml-2">× {item.quantity}</span>
                          </div>
                          <span className="text-gray-700 font-medium flex-shrink-0">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between font-semibold text-sm">
                      <span>Барлығы / Итого:</span>
                      <span className="text-blue-600">{formatPrice(order.total_amount)}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-400 text-xs">Email: </span>
                      <span className="text-gray-600 text-xs">{order.buyer_email}</span>
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
