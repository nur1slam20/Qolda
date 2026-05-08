import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserStore } from '../../store/userStore'
import { sellerApi } from '../../api/seller'
import type { SellerStats } from '../../api/types'

function formatPrice(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

export default function SellerDashboard() {
  const user = useUserStore(s => s.user)
  const [stats, setStats] = useState<SellerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sellerApi.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Сәлем, {user?.name}!
        </h1>
        <p className="text-gray-500 mt-1">Сатушы панелі / Панель продавца</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Тауарлар / Товары</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-100 animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-bold text-blue-600">{stats?.total_products ?? 0}</p>
          )}
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Тапсырыстар / Заказы</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-100 animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-bold text-green-600">{stats?.total_orders ?? 0}</p>
          )}
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Табыс / Выручка</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-100 animate-pulse rounded" />
          ) : (
            <p className="text-2xl font-bold text-amber-600">
              {formatPrice(stats?.total_revenue ?? 0)}
            </p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/seller/add-product"
          className="card p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center gap-3 group"
        >
          <span className="text-4xl">➕</span>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              Тауар қосу
            </p>
            <p className="text-sm text-gray-500">Добавить товар</p>
          </div>
        </Link>

        <Link
          to="/seller/products"
          className="card p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center gap-3 group"
        >
          <span className="text-4xl">📦</span>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              Менің тауарларым
            </p>
            <p className="text-sm text-gray-500">Мои товары</p>
          </div>
        </Link>

        <Link
          to="/seller/orders"
          className="card p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center gap-3 group"
        >
          <span className="text-4xl">🛍️</span>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              Тапсырыстар
            </p>
            <p className="text-sm text-gray-500">Заказы покупателей</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
