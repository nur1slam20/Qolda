import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, ShoppingBag, CreditCard, Plus, Star, Package, XCircle, RotateCcw, Users } from 'lucide-react'
import { sellerApi } from '../../api/seller'
import { ordersApi } from '../../api/orders'
import type { SellerStats, SellerOrder } from '../../api/types'

function fmt(n: number) {
  return '₸' + n.toLocaleString('ru-KZ')
}

function timeAgo(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const min = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (min < 60) return `${min} мин. назад`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} ч. назад`
  return d.toLocaleDateString('ru-KZ', { day: '2-digit', month: 'short' })
}

const ST: Record<string, { dot: string; label: string }> = {
  processing: { dot: 'bg-blue-500',   label: 'В обработке' },
  pending:    { dot: 'bg-amber-500',  label: 'Ожидание'    },
  completed:  { dot: 'bg-green-500',  label: 'Выполнен'    },
  cancelled:  { dot: 'bg-red-500',    label: 'Отменён'     },
  shipped:    { dot: 'bg-purple-500', label: 'Отгружено'   },
}

export default function SellerDashboard() {
  const [stats, setStats]   = useState<SellerStats | null>(null)
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [chartMode, setChartMode] = useState<'week' | 'month'>('week')

  useEffect(() => {
    Promise.all([sellerApi.getStats(), ordersApi.getSellerOrders()])
      .then(([s, o]) => { setStats(s); setOrders(o) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const avgCheck     = stats && stats.total_orders > 0 ? Math.round(stats.total_revenue / stats.total_orders) : 0
  const activeOrders = orders.filter(o => o.status === 'processing' || o.status === 'pending').length
  const uniqueBuyers = new Set(orders.map(o => o.buyer_email)).size

  const monthGrowth = stats && stats.prev_month_revenue > 0
    ? (((stats.month_revenue - stats.prev_month_revenue) / stats.prev_month_revenue) * 100).toFixed(1)
    : null

  const chartData = chartMode === 'week'
    ? (stats?.revenue_by_day ?? [])
    : (stats?.revenue_by_week ?? [])

  const recentOrders = orders.slice(0, 5)

  const topProductMap = orders.reduce((acc: Record<string, number>, o) => {
    o.items.forEach(item => {
      const name = item.product?.name_ru ?? `#${item.product_id}`
      acc[name] = (acc[name] ?? 0) + item.quantity
    })
    return acc
  }, {})
  const bestSeller = Object.entries(topProductMap).sort((a, b) => b[1] - a[1])[0]?.[0]

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-9 bg-gray-100 rounded-lg w-72" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
        </div>
        <div className="h-72 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Дашборд аналитики</h1>
          <p className="text-sm text-gray-400 mt-0.5">Обзор показателей вашего бизнеса на сегодня</p>
        </div>
        <Link
          to="/seller/add-product"
          className="flex items-center gap-2 bg-[#004B57] hover:bg-[#003840] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={15} /> Добавить товар
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[
          {
            label: 'Продажи за месяц',
            value: fmt(stats?.month_revenue ?? 0),
            badge: monthGrowth !== null ? `${Number(monthGrowth) >= 0 ? '+' : ''}${monthGrowth}%` : 'Нет данных',
            badgeCls: monthGrowth !== null && Number(monthGrowth) >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500',
            icon: TrendingUp,
            iconCls: 'bg-[#004B57]/10 text-[#004B57]',
            sub: `Всего: ${fmt(stats?.total_revenue ?? 0)}`,
          },
          {
            label: 'Активные заказы',
            value: activeOrders,
            badge: stats?.cancelled_orders ? `${stats.cancelled_orders} отмен` : 'Без отмен',
            badgeCls: stats?.cancelled_orders ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500',
            icon: ShoppingBag,
            iconCls: 'bg-amber-50 text-amber-500',
            sub: `Всего заказов: ${stats?.total_orders ?? 0}`,
          },
          {
            label: 'Средний чек',
            value: fmt(avgCheck),
            badge: `${uniqueBuyers} покупателей`,
            badgeCls: 'bg-blue-50 text-blue-500',
            icon: CreditCard,
            iconCls: 'bg-green-50 text-green-600',
            sub: `Возвраты: ${stats?.returned_orders ?? 0}`,
          },
        ].map(({ label, value, badge, badgeCls, icon: Icon, iconCls, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm relative">
            <span className={`absolute top-4 right-4 text-xs font-semibold px-2 py-0.5 rounded-full ${badgeCls}`}>
              {badge}
            </span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${iconCls}`}>
              <Icon size={18} />
            </div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Cancellations + Returns + Low stock row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Отмены', value: stats?.cancelled_orders ?? 0, icon: XCircle,    cls: 'text-red-500',   bg: 'bg-red-50'    },
          { label: 'Возвраты', value: stats?.returned_orders ?? 0,  icon: RotateCcw,  cls: 'text-amber-500', bg: 'bg-amber-50'  },
          { label: 'Мало на складе', value: stats?.low_stock_count ?? 0, icon: Package, cls: 'text-[#004B57]', bg: 'bg-[#004B57]/10' },
        ].map(({ label, value, icon: Icon, cls, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon size={17} className={cls} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`text-xl font-bold ${value > 0 ? cls : 'text-gray-900'}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + AI Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">Динамика выручки</h2>
              <p className="text-xs text-gray-400">Сравнение текущей недели с предыдущей</p>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {(['week', 'month'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setChartMode(m)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    chartMode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {m === 'week' ? 'Неделя' : 'Месяц'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <Tooltip
                formatter={(v: number) => [fmt(v), 'Выручка']}
                contentStyle={{ border: 'none', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 13 }}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Bar dataKey="revenue" fill="#004B57" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights */}
        <div className="bg-[#004B57] rounded-xl p-5 text-white shadow-sm flex flex-col">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
              <Star size={15} className="text-amber-300" />
            </div>
            <span className="font-semibold">AI Инсайты</span>
          </div>

          <div className="space-y-3 flex-1">
            <div className="bg-white/10 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">Рекомендации</p>
              <p className="text-xs text-white/90 leading-relaxed">
                {bestSeller
                  ? `Пополните запасы «${bestSeller}» — продажи этого товара растут.`
                  : 'Добавьте товары для получения рекомендаций.'}
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">Популярное</p>
              <p className="text-xs text-white/90 leading-relaxed">
                {(stats?.low_stock_count ?? 0) > 0
                  ? `${stats!.low_stock_count} ${stats!.low_stock_count === 1 ? 'товар заканчивается' : 'товара заканчиваются'}. Подумайте о расширении линейки.`
                  : 'Все товары в достаточном количестве на складе.'}
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5">Трафик</p>
              <p className="text-xs text-white/90 leading-relaxed">
                {activeOrders > 0
                  ? `Пик заказов ожидается в четверг. ${activeOrders} заказов ждут подтверждения.`
                  : 'Заказы обработаны. Активность ожидается в четверг.'}
              </p>
            </div>
          </div>

          <Link
            to="/seller/orders"
            className="mt-4 block text-center text-xs bg-white/15 hover:bg-white/25 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Полный отчёт ассистента
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Последняя активность</h2>
          <Link to="/seller/orders" className="text-xs text-[#004B57] font-medium hover:underline">
            Смотреть все →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">Заказов пока нет</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map(order => {
              const st = ST[order.status] ?? { dot: 'bg-gray-400', label: order.status }
              const name = order.customer_name || order.buyer_name
              return (
                <div key={order.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold flex-shrink-0">
                    {name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Новый заказ #{order.id}
                    </p>
                    <p className="text-xs text-gray-400">{name} · {timeAgo(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
                    <span className="text-xs text-gray-500 hidden sm:block">{st.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    +{fmt(order.total_amount)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { to: '/seller/products',   icon: Package,    label: 'Управление складом' },
          { to: '/seller/orders',     icon: ShoppingBag, label: 'Все заказы'         },
          { to: '/seller/customers',  icon: Users,       label: 'База клиентов'      },
        ].map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 hover:border-[#004B57]/30 hover:shadow-sm transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#004B57]/10 flex items-center justify-center flex-shrink-0">
              <Icon size={16} className="text-[#004B57]" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#004B57] transition-colors">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
