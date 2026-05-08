import { useEffect, useState } from 'react'
import { Search, X, MessageCircle, Trash2 } from 'lucide-react'
import { ordersApi } from '../../api/orders'
import type { SellerOrder } from '../../api/types'

function fmt(n: number) { return n.toLocaleString('ru-KZ') + ' ₸' }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-KZ', { day: '2-digit', month: 'long', year: 'numeric' })
}

interface Customer {
  email: string
  name: string
  phone?: string
  orderCount: number
  totalSpent: number
  lastOrder: string
  orders: SellerOrder[]
}

function CustomerCard({ c, onClose }: { c: Customer; onClose: () => void }) {
  const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const isVip = c.orderCount >= 3

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-end" onClick={onClose}>
      <div
        className="bg-white h-full w-full max-w-sm shadow-2xl flex flex-col overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-900">Карточка клиента</span>
          <div className="flex items-center gap-3">
            <button className="text-xs text-[#004B57] font-medium hover:underline">Изменить</button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center pt-8 pb-4 px-5">
          <div className="w-20 h-20 rounded-full bg-[#004B57]/10 flex items-center justify-center text-[#004B57] text-2xl font-bold mb-3">
            {initials}
          </div>
          <p className="text-lg font-bold text-gray-900">{c.name}</p>
          {isVip && (
            <span className="mt-1.5 text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-0.5 rounded-full">
              VIP КЛИЕНТ
            </span>
          )}

          <div className="flex gap-8 mt-5 w-full justify-center">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{fmt(c.totalSpent)}</p>
              <p className="text-xs text-gray-400">Всего сделано</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{c.orderCount}</p>
              <p className="text-xs text-gray-400">Покупки</p>
            </div>
          </div>
        </div>

        <div className="px-5 space-y-5 pb-6">
          {/* Contact */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Контактная информация</p>
            <div className="space-y-2">
              {c.phone && (
                <div>
                  <p className="text-xs text-gray-400">Телефон</p>
                  <p className="text-sm font-medium text-gray-900">{c.phone}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900">{c.email}</p>
              </div>
            </div>
          </div>

          {/* Order history */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">История покупок</p>
              <span className="text-xs text-gray-400">Последние {Math.min(5, c.orders.length)}</span>
            </div>
            <div className="space-y-2">
              {c.orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Заказ #{order.id}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {order.items[0]?.product?.name_ru ?? 'Товары'} {order.items.length > 1 ? `+${order.items.length - 1}` : ''}
                    </p>
                    <p className="text-xs text-gray-300">{fmtDate(order.created_at)}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {order.status === 'completed' ? 'Выполнен' : order.status === 'cancelled' ? 'Отменён' : 'В работе'}
                    </p>
                    <p className="text-sm font-bold text-gray-900">{fmt(order.total_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto px-5 pb-6 flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 bg-[#004B57] hover:bg-[#003840] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
            <MessageCircle size={15} /> Написать
          </button>
          <button className="p-2.5 border border-red-200 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SellerCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState<Customer | null>(null)

  useEffect(() => {
    ordersApi.getSellerOrders()
      .then((orders: SellerOrder[]) => {
        const map: Record<string, Customer> = {}
        orders.forEach(o => {
          if (!map[o.buyer_email]) {
            map[o.buyer_email] = {
              email: o.buyer_email,
              name: o.customer_name || o.buyer_name,
              phone: o.customer_phone,
              orderCount: 0,
              totalSpent: 0,
              lastOrder: o.created_at,
              orders: [],
            }
          }
          const c = map[o.buyer_email]
          c.orderCount++
          c.totalSpent += o.total_amount
          c.orders.push(o)
          if (o.created_at > c.lastOrder) c.lastOrder = o.created_at
        })
        setCustomers(Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalOrders = customers.reduce((s, c) => s + c.orderCount, 0)
  const avgCheck    = totalOrders > 0
    ? Math.round(customers.reduce((s, c) => s + c.totalSpent, 0) / totalOrders)
    : 0
  const active      = customers.filter(c => c.orderCount > 1).length

  const filtered = customers.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">База клиентов</h1>
        <p className="text-sm text-gray-400 mt-0.5">Управляйте контактами и историей взаимодействия</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Всего клиентов', value: customers.length, note: '+2% в этом месяце' },
          { label: 'Средний чек',    value: fmt(avgCheck),    note: '+5% за неделю'     },
          { label: 'Активных',       value: active,           note: `${Math.round(active / Math.max(1, customers.length) * 100)}%` },
        ].map(({ label, value, note }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{note}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по имени или email"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B57]/20"
            />
          </div>
          <span className="text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1.5">
            Сортировка: По ₸ ↓
          </span>
          <span className="text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1.5">
            Все статусы ▾
          </span>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {search ? 'Ничего не найдено' : 'Клиентов пока нет — ожидайте первых заказов'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-3 px-5 py-2.5 bg-gray-50/70 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <div className="col-span-4">Клиент</div>
              <div className="col-span-4">Контакт</div>
              <div className="col-span-2">Заказов</div>
              <div className="col-span-2">Потрачено</div>
            </div>

            <div className="divide-y divide-gray-50">
              {filtered.map(c => {
                const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                const isVip = c.orderCount >= 3
                return (
                  <div
                    key={c.email}
                    onClick={() => setSelected(c)}
                    className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-gray-50/60 transition-colors cursor-pointer"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#004B57]/10 text-[#004B57] flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                        {isVip && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">VIP</span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-4 min-w-0">
                      {c.phone && <p className="text-sm text-gray-600 truncate">{c.phone}</p>}
                      <p className="text-xs text-gray-400 truncate">{c.email}</p>
                    </div>
                    <div className="col-span-2 text-sm font-medium text-gray-700">{c.orderCount}</div>
                    <div className="col-span-2 text-sm font-semibold text-gray-900">{fmt(c.totalSpent)}</div>
                  </div>
                )
              })}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              Показано {filtered.length} из {customers.length} клиентов
            </div>
          </>
        )}
      </div>

      {selected && <CustomerCard c={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
