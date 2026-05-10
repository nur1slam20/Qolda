import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Download, Lightbulb, TrendingUp, ShieldCheck, ShieldAlert, ShieldX, Loader2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, ResponsiveContainer, Tooltip,
} from 'recharts'
import { productsApi } from '../../api/products'
import { ordersApi } from '../../api/orders'
import type { Product, SellerOrder, PlagiarismResult } from '../../api/types'
import ProductImage from '../../components/ProductImage'

function fmt(n: number) { return n.toLocaleString('ru-KZ') + ' ₸' }

function genSKU(product: Product): string {
  const cat = product.category.slice(0, 3).toUpperCase()
  const words = product.name_ru.split(' ')
  const abbr = words.slice(0, 2).map(w => w.slice(0, 3).toUpperCase()).join('-')
  return `${cat}-${abbr}-${product.id}`
}

function stockBadge(stock: number) {
  if (stock === 0)  return { label: 'НЕТ В НАЛИЧИИ', cls: 'bg-red-100 text-red-600',    bar: 'bg-red-400',    w: 100 }
  if (stock <= 10)  return { label: 'МАЛО',           cls: 'bg-amber-100 text-amber-600', bar: 'bg-amber-400',  w: Math.max(15, (stock / 10) * 100) }
  return               { label: 'АКТИВЕН',            cls: 'bg-green-100 text-green-700', bar: 'bg-[#004B57]',  w: Math.min(100, (stock / 200) * 100) }
}

const CAT_COLOR: Record<string, string> = {
  Electronics: 'bg-blue-50 text-blue-700',
  Clothing:    'bg-purple-50 text-purple-700',
  Books:       'bg-yellow-50 text-yellow-700',
  Home:        'bg-orange-50 text-orange-700',
  Sports:      'bg-green-50 text-green-700',
}

const PLAG_CFG = {
  verified:   { icon: ShieldCheck, cls: 'text-green-600 bg-green-50',  label: 'Проверен'   },
  suspicious: { icon: ShieldAlert, cls: 'text-amber-600 bg-amber-50',  label: 'Подозрительный' },
  high_risk:  { icon: ShieldX,     cls: 'text-red-600 bg-red-50',      label: 'Высокий риск'   },
} as const

function PlagiarismBadge({
  result,
  checking,
  onCheck,
}: {
  result?: PlagiarismResult
  checking: boolean
  onCheck: () => void
}) {
  if (checking) {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <Loader2 size={12} className="animate-spin" /> Проверка...
      </span>
    )
  }

  if (!result) {
    return (
      <button
        onClick={onCheck}
        className="text-xs text-[#004B57] border border-[#004B57]/30 rounded-lg px-2 py-1 hover:bg-[#004B57]/5 transition-colors font-medium"
      >
        Проверить
      </button>
    )
  }

  const cfg = PLAG_CFG[result.status]
  const Icon = cfg.icon
  return (
    <div className="space-y-1">
      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
        <Icon size={11} />
        {cfg.label}
      </span>
      {result.matches.length > 0 && (
        <p className="text-xs text-gray-400 truncate max-w-[120px]" title={result.matches[0].name_ru}>
          ≈ {Math.round(result.max_similarity * 100)}% — {result.matches[0].name_ru}
        </p>
      )}
    </div>
  )
}

export default function SellerProducts() {
  const [products, setProducts]         = useState<Product[]>([])
  const [orders, setOrders]             = useState<SellerOrder[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [plagResults, setPlagResults]   = useState<Record<number, PlagiarismResult>>({})
  const [checking, setChecking]         = useState<Set<number>>(new Set())

  const load = () => {
    setLoading(true)
    Promise.all([productsApi.getMine(), ordersApi.getSellerOrders()])
      .then(([d, o]) => { setProducts(d.items); setOrders(o) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Удалить «${name}»?`)) return
    try {
      await productsApi.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch { alert('Не удалось удалить товар') }
  }

  const handlePlagiarismCheck = async (id: number) => {
    setChecking(prev => new Set(prev).add(id))
    try {
      const result = await productsApi.checkPlagiarism(id)
      setPlagResults(prev => ({ ...prev, [id]: result }))
    } catch { /* silent */ }
    finally {
      setChecking(prev => { const s = new Set(prev); s.delete(id); return s })
    }
  }

  const lowStock  = products.filter(p => p.stock > 0 && p.stock <= 10).length
  const outStock  = products.filter(p => p.stock === 0).length
  const totalVal  = products.reduce((s, p) => s + (p.discount_price ?? p.price) * p.stock, 0)
  const catCount  = new Set(products.map(p => p.category)).size

  const filtered = products.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.name_ru.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || genSKU(p).toLowerCase().includes(q)
  })

  const salesMap = orders.reduce((acc: Record<number, number>, o) => {
    o.items.forEach(item => { acc[item.product_id] = (acc[item.product_id] ?? 0) + item.quantity })
    return acc
  }, {})

  const topProducts = [...products]
    .sort((a, b) => (salesMap[b.id] ?? 0) - (salesMap[a.id] ?? 0))
    .slice(0, 5)

  const forecastData = topProducts.map(p => ({
    name: p.name_ru.split(' ')[0],
    qty: salesMap[p.id] ?? 0,
  }))

  const bestSeller = topProducts[0]
  const daysLeft   = bestSeller ? Math.round(bestSeller.stock / Math.max(1, (salesMap[bestSeller.id] ?? 1) / 30)) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление складом</h1>
          <p className="text-sm text-gray-400 mt-0.5">Отслеживайте остатки, управляйте ассортиментом и контролируйте поставки</p>
        </div>
        <Link
          to="/seller/add-product"
          className="flex items-center gap-2 bg-[#004B57] hover:bg-[#003840] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          + Добавить товар
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Всего товаров',      value: products.length, note: '+2%',               noteCls: 'text-green-500' },
          { label: 'Низкий остаток',     value: lowStock,        note: lowStock > 0 ? 'Критично' : 'Норма', noteCls: lowStock > 0 ? 'text-red-500' : 'text-gray-400' },
          { label: 'Стоимость склада',   value: totalVal >= 1000000 ? `${(totalVal/1000000).toFixed(1)}М ₸` : fmt(totalVal), note: 'Текущая', noteCls: 'text-gray-400' },
          { label: 'Активных категорий', value: catCount,        note: 'Без изменений',     noteCls: 'text-gray-400' },
        ].map(({ label, value, note, noteCls }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-2">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className={`text-xs font-medium mt-1 ${noteCls}`}>{note}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по названию или SKU"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B57]/20"
            />
          </div>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
            <Filter size={13} /> Фильтры
          </button>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
            <Download size={13} /> Экспорт
          </button>
          {outStock > 0 && (
            <span className="ml-auto text-xs bg-red-50 text-red-500 border border-red-100 rounded-full px-3 py-1 font-medium">
              {outStock} нет в наличии
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {search ? 'Ничего не найдено' : (
              <span>Товаров нет. <Link to="/seller/add-product" className="text-[#004B57] hover:underline">Добавить →</Link></span>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-3 px-5 py-2.5 bg-gray-50/70 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <div className="col-span-3">Товар</div>
              <div className="col-span-2">SKU</div>
              <div className="col-span-1">Категория</div>
              <div className="col-span-2">Остаток</div>
              <div className="col-span-1">Цена</div>
              <div className="col-span-2">Антиплагиат</div>
              <div className="col-span-1">Статус</div>
            </div>

            <div className="divide-y divide-gray-50">
              {filtered.map(p => {
                const st  = stockBadge(p.stock)
                const sku = genSKU(p)
                const catCls = CAT_COLOR[p.category] ?? 'bg-gray-100 text-gray-600'
                return (
                  <div key={p.id} className="grid grid-cols-12 gap-3 px-5 py-3 items-center hover:bg-gray-50/50 transition-colors group">
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                        <ProductImage src={p.image_url} alt={p.name_ru} className="w-full h-full object-cover" iconSize={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.name_ru}</p>
                        <p className="text-xs text-gray-400 truncate">{p.name_kz}</p>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                        {sku}
                      </span>
                    </div>

                    <div className="col-span-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catCls}`}>
                        {p.category}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span className={`text-sm font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock <= 10 ? 'text-amber-500' : 'text-gray-900'}`}>
                        {p.stock}
                      </span>
                      <div className="mt-1 h-1 bg-gray-100 rounded-full w-14">
                        <div className={`h-1 rounded-full ${st.bar}`} style={{ width: `${st.w}%` }} />
                      </div>
                    </div>

                    <div className="col-span-1">
                      <p className="text-sm font-semibold text-gray-900">{fmt(p.discount_price ?? p.price)}</p>
                      {p.discount_price && (
                        <p className="text-xs text-gray-400 line-through">{fmt(p.price)}</p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <PlagiarismBadge
                        result={plagResults[p.id]}
                        checking={checking.has(p.id)}
                        onCheck={() => handlePlagiarismCheck(p.id)}
                      />
                    </div>

                    <div className="col-span-1 flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${st.cls}`}>
                        {st.label}
                      </span>
                      <button
                        onClick={() => handleDelete(p.id, p.name_ru)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all text-sm ml-1"
                        title="Удалить"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-400">Показано {filtered.length} из {products.length} товаров</span>
              <div className="flex items-center gap-1">
                {[1].map(n => (
                  <button key={n} className="w-7 h-7 rounded-lg text-xs font-semibold bg-[#004B57] text-white">
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom: AI + Forecast */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* AI Recommendations */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-[#004B57]/10 rounded-lg flex items-center justify-center">
                <Lightbulb size={14} className="text-[#004B57]" />
              </div>
              <span className="font-semibold text-gray-900 text-sm">AI Рекомендации</span>
            </div>
            {bestSeller ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Запасы «<span className="font-medium">{bestSeller.name_ru}</span>» заканчиваются критически мало.
                  С учётом динамики продаж за последние 30 дней, товар закончится через{' '}
                  <span className="font-semibold text-[#004B57]">{daysLeft ?? '?'} д.</span>{' '}
                  Рекомендуем сделать заказ на 15 единиц, сегодня.
                </p>
                <button className="mt-2 text-xs font-semibold text-[#004B57] hover:underline uppercase tracking-wide">
                  Создать заказ поставщику →
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Недостаточно данных для рекомендаций.</p>
            )}
          </div>

          {/* Forecast */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-[#004B57]/10 rounded-lg flex items-center justify-center">
                <TrendingUp size={14} className="text-[#004B57]" />
              </div>
              <span className="font-semibold text-gray-900 text-sm">Прогноз продаж</span>
            </div>
            {forecastData.some(d => d.qty > 0) ? (
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={forecastData} barSize={20}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number) => [v + ' шт.', 'Продано']}
                    contentStyle={{ fontSize: 12, border: 'none', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="qty" fill="#004B57" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">Данных по продажам пока нет</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
