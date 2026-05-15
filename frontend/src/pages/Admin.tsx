import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts'
import {
  LayoutDashboard, Users, ShoppingBag, Package,
  Trash2, Shield, ShieldOff, UserCheck, UserX, RefreshCw,
} from 'lucide-react'
import type { AdminStats, User, Product } from '../api/types'
import { adminApi, type AdminOrder } from '../api/admin'
import { confirm } from '../components/ConfirmDialog'
import { toast } from '../store/toastStore'

type Tab = 'dashboard' | 'users' | 'orders' | 'products'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  processing: { label: 'В обработке', color: 'bg-blue-100 text-blue-700' },
  pending:    { label: 'Ожидает',     color: 'bg-yellow-100 text-yellow-700' },
  shipped:    { label: 'В пути',      color: 'bg-purple-100 text-purple-700' },
  completed:  { label: 'Выполнен',   color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Отменён',    color: 'bg-red-100 text-red-600' },
}

const ALL_STATUSES = ['', 'processing', 'pending', 'shipped', 'completed', 'cancelled']

function formatPrice(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>('dashboard')

  const [stats, setStats]         = useState<AdminStats | null>(null)
  const [users, setUsers]         = useState<User[]>([])
  const [orders, setOrders]       = useState<AdminOrder[]>([])
  const [products, setProducts]   = useState<Product[]>([])
  const [loading, setLoading]     = useState(true)
  const [retraining, setRetraining] = useState(false)
  const [retrainMsg, setRetrainMsg] = useState('')
  const [orderStatus, setOrderStatus] = useState('')

  useEffect(() => {
    adminApi.stats().then(setStats).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (tab === 'users' && users.length === 0) {
      adminApi.getUsers().then(setUsers)
    }
    if (tab === 'products' && products.length === 0) {
      adminApi.getProducts().then(setProducts)
    }
  }, [tab])

  useEffect(() => {
    if (tab === 'orders') {
      adminApi.getOrders(orderStatus || undefined).then(setOrders)
    }
  }, [tab, orderStatus])

  const handleRetrain = async () => {
    setRetraining(true)
    setRetrainMsg('')
    try {
      const result = await adminApi.retrain()
      setRetrainMsg(`✅ Модель переобучена! ${result.meta?.num_ratings || 0} рейтингов`)
      adminApi.stats().then(setStats)
    } catch {
      setRetrainMsg('❌ Ошибка при переобучении')
    } finally {
      setRetraining(false)
    }
  }

  const toggleSeller = async (user: User) => {
    const updated = await adminApi.updateUserRole(user.id, { is_seller: !user.is_seller })
    setUsers(prev => prev.map(u => u.id === user.id ? updated : u))
  }

  const toggleAdmin = async (user: User) => {
    const updated = await adminApi.updateUserRole(user.id, { is_admin: !user.is_admin })
    setUsers(prev => prev.map(u => u.id === user.id ? updated : u))
  }

  const deleteUser = async (userId: number) => {
    if (!await confirm('Удалить пользователя? Это действие необратимо.')) return
    await adminApi.deleteUser(userId)
    setUsers(prev => prev.filter(u => u.id !== userId))
    toast.success('Пользователь удалён')
  }

  const deleteProduct = async (productId: number) => {
    if (!await confirm('Удалить товар? Это действие необратимо.')) return
    await adminApi.deleteProduct(productId)
    setProducts(prev => prev.filter(p => p.id !== productId))
    toast.success('Товар удалён')
  }

  const TABS = [
    { id: 'dashboard' as Tab, icon: LayoutDashboard, label: 'Дашборд' },
    { id: 'users'     as Tab, icon: Users,           label: 'Пользователи' },
    { id: 'orders'    as Tab, icon: ShoppingBag,     label: 'Заказы' },
    { id: 'products'  as Tab, icon: Package,         label: 'Товары' },
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const meta = (stats?.model_meta ?? {}) as Record<string, string | number | boolean>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Админ-панель</h1>
        <button onClick={() => adminApi.stats().then(setStats)} className="btn-secondary text-sm flex items-center gap-1.5">
          <RefreshCw size={14} /> Обновить
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Заказы', value: stats.total_orders, color: 'text-gray-900' },
              { label: 'Выручка', value: formatPrice(stats.total_revenue), color: 'text-green-600' },
              { label: 'Пользователи', value: stats.total_users, color: 'text-blue-600' },
              { label: 'Товары', value: stats.total_products, color: 'text-purple-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-6">
                <p className="text-sm text-gray-500">{label}</p>
                <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Топ товаров (по продажам)</h2>
              {stats.top_products.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={stats.top_products} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-center py-10">Нет данных</p>
              )}
            </div>

            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">CTR рекомендаций</h2>
              {stats.ctr_data.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={stats.ctr_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="shown" stroke="#3b82f6" name="Показано" dot={false} />
                    <Line type="monotone" dataKey="clicked" stroke="#10b981" name="Кликнуто" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-center py-10">Нет данных</p>
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold text-gray-900 mb-1">ML Модель</h2>
                <p className="text-sm text-gray-500 mb-4">Hybrid Recommender (SVD 0.6 + TF-IDF 0.4)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {[
                    { label: 'Последнее обучение', value: meta.last_trained_at ? new Date(meta.last_trained_at as string).toLocaleString('ru-RU') : '—' },
                    { label: 'Товаров', value: meta.num_products ?? '—' },
                    { label: 'Пользователей', value: meta.num_users ?? '—' },
                    { label: 'Рейтингов', value: meta.num_ratings ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-gray-400">{label}</p>
                      <p className="font-semibold">{String(value)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${meta.collab_available ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {meta.collab_available ? '✓ Collaborative (SVD)' : '⚠ SVD недоступен'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                    ✓ Content-Based (TF-IDF)
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={handleRetrain} disabled={retraining} className="btn-primary">
                  {retraining ? '⏳ Обучение...' : '🔄 Переобучить модель'}
                </button>
                {retrainMsg && <p className="text-sm text-gray-600">{retrainMsg}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── USERS ── */}
      {tab === 'users' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Пользователи ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Имя</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Роль</th>
                  <th className="px-4 py-3 text-left">Дата</th>
                  <th className="px-4 py-3 text-left">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-gray-400">#{u.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {u.is_admin && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Админ</span>}
                        {u.is_seller && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Продавец</span>}
                        {!u.is_admin && !u.is_seller && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Покупатель</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString('ru-RU')}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleSeller(u)}
                          title={u.is_seller ? 'Снять роль продавца' : 'Сделать продавцом'}
                          className={`p-1.5 rounded-lg transition-colors ${u.is_seller ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                          {u.is_seller ? <UserCheck size={14} /> : <UserX size={14} />}
                        </button>
                        <button
                          onClick={() => toggleAdmin(u)}
                          title={u.is_admin ? 'Снять права админа' : 'Сделать админом'}
                          className={`p-1.5 rounded-lg transition-colors ${u.is_admin ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                          {u.is_admin ? <Shield size={14} /> : <ShieldOff size={14} />}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ORDERS ── */}
      {tab === 'orders' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {ALL_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setOrderStatus(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  orderStatus === s ? 'bg-[#004B57] text-white border-[#004B57]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {s === '' ? 'Все' : STATUS_LABELS[s]?.label ?? s}
              </button>
            ))}
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Заказы ({orders.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Покупатель</th>
                    <th className="px-4 py-3 text-left">Сумма</th>
                    <th className="px-4 py-3 text-left">Товаров</th>
                    <th className="px-4 py-3 text-left">Статус</th>
                    <th className="px-4 py-3 text-left">Дата</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(o => {
                    const si = STATUS_LABELS[o.status] ?? { label: o.status, color: 'bg-gray-100 text-gray-600' }
                    return (
                      <tr key={o.id} className="hover:bg-gray-50/60">
                        <td className="px-4 py-3 text-gray-400">#{o.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{o.buyer_name}</p>
                          <p className="text-xs text-gray-400">{o.buyer_email}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(o.total_amount)}</td>
                        <td className="px-4 py-3 text-gray-500">{o.items_count} шт.</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${si.color}`}>{si.label}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{new Date(o.created_at).toLocaleDateString('ru-RU')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {tab === 'products' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Товары ({products.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Название</th>
                  <th className="px-4 py-3 text-left">Категория</th>
                  <th className="px-4 py-3 text-left">Цена</th>
                  <th className="px-4 py-3 text-left">Остаток</th>
                  <th className="px-4 py-3 text-left">Рейтинг</th>
                  <th className="px-4 py-3 text-left">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-gray-400">#{p.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{p.name_ru}</td>
                    <td className="px-4 py-3 text-gray-500">{p.category}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${p.stock <= 10 ? 'text-red-500' : 'text-gray-900'}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">⭐ {p.avg_rating.toFixed(1)} ({p.review_count})</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
