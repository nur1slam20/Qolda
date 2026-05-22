import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Package, TrendingDown, CheckCircle, Plus, Minus, Save, RefreshCw } from 'lucide-react'
import { productsApi } from '../../api/products'
import { toast } from '../../store/toastStore'
import type { Product } from '../../api/types'

const LOW_STOCK      = 10
const CRITICAL_STOCK = 3

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full"><AlertTriangle size={10} /> Нет</span>
  if (stock <= CRITICAL_STOCK)
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><AlertTriangle size={10} /> Критично</span>
  if (stock <= LOW_STOCK)
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><TrendingDown size={10} /> Мало</span>
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle size={10} /> В наличии</span>
}

function StockEditor({ product, onSaved }: { product: Product; onSaved: (p: Product) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue]     = useState(product.stock)
  const [saving, setSaving]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const open = () => { setValue(product.stock); setEditing(true); setTimeout(() => inputRef.current?.focus(), 50) }
  const cancel = () => { setEditing(false); setValue(product.stock) }

  const save = async (newVal?: number) => {
    const v = newVal ?? value
    if (v === product.stock) { setEditing(false); return }
    setSaving(true)
    try {
      const updated = await productsApi.updateStock(product.id, v)
      onSaved(updated)
      setEditing(false)
      toast.success(`Остаток обновлён: ${v} шт.`)
    } catch {
      toast.error('Не удалось обновить')
    } finally {
      setSaving(false)
    }
  }

  const adjust = (delta: number) => {
    const next = Math.max(0, product.stock + delta)
    save(next)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="number"
          min={0}
          value={value}
          onChange={e => setValue(Number(e.target.value))}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
          className="w-20 text-center border border-[#004B57] rounded-lg px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#004B57]/30"
        />
        <button onClick={() => save()} disabled={saving}
          className="p-1.5 bg-[#004B57] text-white rounded-lg hover:bg-[#003840] disabled:opacity-50 transition-colors">
          {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
        </button>
        <button onClick={cancel} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => adjust(-1)} disabled={product.stock === 0}
        className="w-6 h-6 rounded-md bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 flex items-center justify-center transition-colors disabled:opacity-30">
        <Minus size={11} />
      </button>
      <button
        onClick={open}
        className={`text-lg font-black min-w-[2.5rem] text-center px-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ${
          product.stock === 0 ? 'text-red-600' :
          product.stock <= CRITICAL_STOCK ? 'text-red-600' :
          product.stock <= LOW_STOCK ? 'text-amber-600' : 'text-gray-900'
        }`}
        title="Нажмите для редактирования"
      >
        {product.stock}
      </button>
      <button onClick={() => adjust(+1)}
        className="w-6 h-6 rounded-md bg-gray-100 hover:bg-green-100 text-gray-500 hover:text-green-600 flex items-center justify-center transition-colors">
        <Plus size={11} />
      </button>
    </div>
  )
}

export default function SellerWarehouse() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<'all' | 'low' | 'critical'>('all')
  const [search, setSearch]     = useState('')

  useEffect(() => {
    productsApi.getMine()
      .then(r => setProducts(r.items))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSaved = (updated: Product) =>
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))

  const critical = products.filter(p => p.stock <= CRITICAL_STOCK)
  const low      = products.filter(p => p.stock > CRITICAL_STOCK && p.stock <= LOW_STOCK)
  const ok       = products.filter(p => p.stock > LOW_STOCK)

  const base = filter === 'critical' ? critical
    : filter === 'low' ? [...critical, ...low]
    : products

  const visible = search
    ? base.filter(p => p.name_ru.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
    : base

  const totalStock = products.reduce((s, p) => s + p.stock, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Склад</h1>
          <p className="text-sm text-gray-400 mt-0.5">Контроль и пополнение остатков товаров</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Позиций',         value: products.length, icon: Package,       cls: 'text-gray-700',   bg: 'bg-gray-50',    border: 'border-gray-100' },
          { label: 'Всего единиц',    value: totalStock,      icon: Package,       cls: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-100' },
          { label: 'Мало (≤10 шт)',   value: low.length + critical.length, icon: TrendingDown, cls: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'Критично (≤3 шт)',value: critical.length, icon: AlertTriangle, cls: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-100'  },
        ].map(({ label, value, icon: Icon, cls, bg, border }) => (
          <div key={label} className={`rounded-xl border p-4 shadow-sm ${bg} ${border}`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className={cls} />
              <p className="text-xs text-gray-500">{label}</p>
            </div>
            <p className={`text-2xl font-black ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Alert */}
      {critical.length > 0 && (
        <div className="rounded-xl p-4 flex items-start gap-3 bg-red-50 border border-red-100">
          <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {critical.length} {critical.length === 1 ? 'товар' : 'товара'} на грани окончания!
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              {critical.map(p => p.name_ru).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters + search */}
        <div className="flex items-center border-b border-gray-100 px-4 gap-2 flex-wrap">
          <div className="flex">
            {[
              { key: 'all',      label: 'Все',      count: products.length },
              { key: 'low',      label: 'Мало',     count: low.length + critical.length },
              { key: 'critical', label: 'Критично', count: critical.length },
            ].map(({ key, label, count }) => (
              <button key={key} onClick={() => setFilter(key as typeof filter)}
                className={`py-3.5 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  filter === key ? 'border-[#004B57] text-[#004B57]' : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}>
                {label}
                <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">{count}</span>
              </button>
            ))}
          </div>
          <div className="ml-auto py-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск товара..."
              className="pl-3 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B57]/20 w-44"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {products.length === 0 ? 'Нет товаров' : 'Ничего не найдено'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-3 px-5 py-2.5 bg-gray-50/70 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <div className="col-span-5">Товар</div>
              <div className="col-span-2">Категория</div>
              <div className="col-span-3">Остаток (нажми для ред.)</div>
              <div className="col-span-1">Статус</div>
              <div className="col-span-1">Цена</div>
            </div>

            <div className="divide-y divide-gray-50">
              {visible
                .sort((a, b) => a.stock - b.stock)
                .map(product => (
                  <div key={product.id}
                    className={`grid grid-cols-12 gap-3 px-5 py-3.5 items-center transition-colors ${
                      product.stock === 0 ? 'bg-red-50/50' :
                      product.stock <= CRITICAL_STOCK ? 'bg-red-50/30' :
                      product.stock <= LOW_STOCK ? 'bg-amber-50/30' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="col-span-5">
                      <p className="text-sm font-semibold text-gray-900 truncate">{product.name_ru}</p>
                      <p className="text-xs text-gray-400 truncate">{product.name_kz}</p>
                    </div>
                    <div className="col-span-2 text-xs text-gray-500">{product.category}</div>
                    <div className="col-span-3">
                      <StockEditor product={product} onSaved={handleSaved} />
                    </div>
                    <div className="col-span-1">
                      <StockBadge stock={product.stock} />
                    </div>
                    <div className="col-span-1 text-sm font-semibold text-gray-900">
                      {(product.discount_price ?? product.price).toLocaleString('ru-KZ')} ₸
                    </div>
                  </div>
                ))}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {visible.length} из {products.length} позиций · {ok.length} в норме
              </span>
              <p className="text-xs text-gray-400">
                💡 Нажмите на число или ± чтобы изменить остаток
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
