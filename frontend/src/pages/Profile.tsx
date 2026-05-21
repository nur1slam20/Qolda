import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, Zap, ShoppingBag, Edit2, Check, X,
  TrendingUp, Star, Clock, CheckCircle, XCircle, MessageCircle,
  BarChart2, Award
} from 'lucide-react'
import type { Order, Recommendation } from '../api/types'
import { recsApi } from '../api/recommendations'
import { ordersApi } from '../api/orders'
import { authApi } from '../api/auth'
import { useUserStore } from '../store/userStore'
import { toast } from '../store/toastStore'
import RecommendationCard from '../components/RecommendationCard'

function formatPrice(n: number) { return n.toLocaleString('ru-KZ') + ' ₸' }

function StatPill({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string
}) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${color} bg-opacity-10`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} bg-opacity-20`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-lg font-black text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, setAuth } = useUserStore()
  const [recs, setRecs]   = useState<Recommendation[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading]   = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)

  const [editing, setEditing] = useState(false)
  const [name, setName]       = useState(user?.name ?? '')
  const [email, setEmail]     = useState(user?.email ?? '')
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    if (!user) return
    setName(user.name)
    setEmail(user.email)
    recsApi.forUser(user.id, 8).then(setRecs).finally(() => setLoading(false))
    ordersApi.getUserOrders(user.id).then(setOrders).finally(() => setLoadingOrders(false))
  }, [user])

  if (!user) return null

  const initials = user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  // Analytics
  const totalSpent    = orders.reduce((s, o) => s + o.total_amount, 0)
  const completed     = orders.filter(o => o.status === 'completed').length
  const active        = orders.filter(o => ['pending','processing','shipped'].includes(o.status)).length
  const cancelled     = orders.filter(o => o.status === 'cancelled').length

  // Top categories from orders
  const catMap: Record<string, number> = {}
  orders.forEach(o => o.items.forEach(item => {
    const cat = item.product?.category ?? 'Другое'
    catMap[cat] = (catMap[cat] || 0) + item.quantity * item.price
  }))
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 3)
  const maxCatVal = topCats[0]?.[1] ?? 1

  // Last order date
  const lastOrder = orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const updated = await authApi.updateMe({ name: name.trim(), email: email.trim() })
      const token = localStorage.getItem('token') ?? ''
      setAuth(updated, token)
      setEditing(false)
      toast.success('Профиль сақталды / Профиль сохранён')
    } catch {
      toast.error('Сақтау қатесі / Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => { setName(user.name); setEmail(user.email); setEditing(false) }

  const methodCounts = recs.reduce<Record<string, number>>((acc, r) => {
    acc[r.method] = (acc[r.method] || 0) + 1; return acc
  }, {})
  const METHOD_COLORS: Record<string, string> = {
    collaborative: 'bg-purple-100 text-purple-700',
    content_based: 'bg-[#004B57]/10 text-[#004B57]',
    popular:       'bg-amber-100 text-amber-700',
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero card */}
      <div className="bg-gradient-to-br from-[#004B57] to-[#006070] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-white/20 text-white text-2xl flex items-center justify-center font-bold flex-shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <input
                  className="bg-white/15 border border-white/20 text-white placeholder-white/50 rounded-lg px-3 py-1.5 text-sm w-full max-w-xs focus:outline-none focus:border-white/40"
                  value={name} onChange={e => setName(e.target.value)} placeholder="Имя"
                />
                <input
                  type="email"
                  className="bg-white/15 border border-white/20 text-white placeholder-white/50 rounded-lg px-3 py-1.5 text-sm w-full max-w-xs focus:outline-none focus:border-white/40"
                  value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
                />
              </div>
            ) : (
              <>
                <h1 className="text-xl md:text-2xl font-bold">{user.name}</h1>
                <p className="text-white/60 text-sm mt-0.5">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-white/40 text-xs">
                    Тіркелген: {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </p>
                  {user.is_seller && <span className="bg-[#F5A623]/20 text-[#F5A623] text-xs px-2 py-0.5 rounded-full font-medium">Продавец</span>}
                  {user.is_admin  && <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">Admin</span>}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors">
                  <Check size={14} /> {saving ? '...' : 'Сохранить'}
                </button>
                <button onClick={handleCancel}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white/70 text-sm px-3 py-2 rounded-xl transition-colors">
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors border border-white/10">
                  <Edit2 size={14} /> Редактировать
                </button>
                <Link to="/orders"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors border border-white/10">
                  <Package size={15} /> Заказы
                </Link>
                <Link to="/chat"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors border border-white/10">
                  <MessageCircle size={15} /> Чат
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Analytics section */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 size={20} className="text-[#004B57]" />
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Моя аналитика</h2>
        </div>

        {loadingOrders ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="card p-4 text-center">
                <p className="text-2xl font-black text-[#004B57] dark:text-teal-400">{formatPrice(totalSpent)}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                  <TrendingUp size={11} /> Потрачено всего
                </p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-2xl font-black text-gray-900 dark:text-white">{orders.length}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                  <Package size={11} /> Всего заказов
                </p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-2xl font-black text-green-600">{completed}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                  <CheckCircle size={11} /> Выполнено
                </p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-2xl font-black text-blue-600">{active}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                  <Clock size={11} /> Активных
                </p>
              </div>
            </div>

            {/* Two columns: categories + order status chart */}
            {orders.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Top categories */}
                {topCats.length > 0 && (
                  <div className="card p-5">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                      <Award size={15} className="text-[#004B57]" /> Топ категории покупок
                    </p>
                    <div className="space-y-3">
                      {topCats.map(([cat, val]) => (
                        <div key={cat}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat}</span>
                            <span className="text-xs font-bold text-[#004B57] dark:text-teal-400">{formatPrice(val)}</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#004B57] to-teal-400 rounded-full transition-all duration-700"
                              style={{ width: `${(val / maxCatVal) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order status breakdown */}
                <div className="card p-5">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <Package size={15} className="text-[#004B57]" /> Статусы заказов
                  </p>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Выполнено',    value: completed,  color: 'bg-green-500',  icon: CheckCircle, text: 'text-green-600' },
                      { label: 'Активные',     value: active,     color: 'bg-blue-500',   icon: Clock,       text: 'text-blue-600' },
                      { label: 'Отменено',     value: cancelled,  color: 'bg-red-400',    icon: XCircle,     text: 'text-red-500' },
                    ].map(s => (
                      <div key={s.label} className="flex items-center gap-3">
                        <s.icon size={14} className={s.text} />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-24">{s.label}</span>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${s.color} rounded-full transition-all duration-700`}
                            style={{ width: orders.length ? `${(s.value / orders.length) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-6 text-right">{s.value}</span>
                      </div>
                    ))}
                  </div>
                  {lastOrder && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-800">
                      <p className="text-xs text-gray-400">
                        Последний заказ: <span className="font-semibold text-gray-600 dark:text-gray-300">
                          {new Date(lastOrder.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {orders.length === 0 && (
              <div className="card p-8 text-center">
                <ShoppingBag size={36} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-400 font-medium">Заказов пока нет</p>
                <p className="text-sm text-gray-400 mt-1">Сделайте первый заказ, чтобы увидеть аналитику</p>
                <Link to="/" className="inline-flex items-center gap-2 mt-4 bg-[#004B57] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#003840] transition-colors">
                  <ShoppingBag size={15} /> В магазин
                </Link>
              </div>
            )}

            {/* Rating badge */}
            {completed >= 5 && (
              <div className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
                  <Star size={18} className="text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-amber-800 dark:text-amber-400 text-sm">Постоянный покупатель</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">{completed} выполненных заказов — спасибо за доверие!</p>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ML Recommendations */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Менің рекомендацияларым</h2>
            <p className="text-sm text-gray-400 mt-0.5">Мои персональные рекомендации</p>
          </div>
          <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-100 w-fit">
            <Zap size={11} /> ML · Hybrid (SVD + TF-IDF)
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Collaborative Filtering (SVD) + Content-Based Filtering (TF-IDF) гибридтік моделі негізінде жасалған ұсыныстар
        </p>

        {recs.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {Object.entries(methodCounts).map(([method, count]) => (
              <span key={method} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${METHOD_COLORS[method] ?? 'bg-gray-100 text-gray-600'}`}>
                {method.replace('_', ' ')} · {count}
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recs.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <ShoppingBag size={40} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium text-gray-500">Рекомендациялар жоқ</p>
            <p className="text-sm text-gray-400 mt-1">Сатып алыңыз — ML-жүйе сізге ұқсас тауарларды ұсынады</p>
            <Link to="/" className="inline-flex items-center gap-2 mt-5 bg-[#004B57] hover:bg-[#003840] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              <ShoppingBag size={15} /> Дүкенге / В магазин
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recs.map(r => <RecommendationCard key={r.product.id} rec={r} />)}
          </div>
        )}
      </section>
    </div>
  )
}
