import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Order } from '../api/types'
import { ordersApi } from '../api/orders'
import { useUserStore } from '../store/userStore'
import ProductImage from '../components/ProductImage'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Күтілуде / Ожидает',     color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Өңделуде / В обработке', color: 'bg-blue-100 text-blue-700' },
  shipped:    { label: 'Жолда / В пути',          color: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Жеткізілді / Доставлено', color: 'bg-green-100 text-green-700' },
}

function formatPrice(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

export default function Orders() {
  const user = useUserStore(s => s.user)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    ordersApi.getUserOrders(user.id)
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [user])

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
            const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' }
            const isExpanded = expanded === order.id
            return (
              <div key={order.id} className="card">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-xl"
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
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
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-600">{formatPrice(order.total_amount)}</span>
                    <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-3">
                    {order.delivery_address && (
                      <p className="text-sm text-gray-500">
                        📍 {order.delivery_address}
                      </p>
                    )}
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
                          <Link to={`/product/${item.product_id}`} className="font-medium hover:text-blue-600">
                            {item.product?.name_ru || `Тауар #${item.product_id}`}
                          </Link>
                          <p className="text-gray-500">{item.quantity} дана × {formatPrice(item.price)}</p>
                        </div>
                        <span className="font-semibold">{formatPrice(item.quantity * item.price)}</span>
                      </div>
                    ))}
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
