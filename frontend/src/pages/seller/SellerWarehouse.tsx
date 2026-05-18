import { useEffect, useState, useRef } from 'react'
import { AlertTriangle, Package, TrendingDown, CheckCircle, Pencil, Check, X } from 'lucide-react'
import { productsApi } from '../../api/products'
import type { Product } from '../../api/types'

const LOW_STOCK = 10
const CRITICAL_STOCK = 3

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Нет в наличии</span>
  if (stock <= CRITICAL_STOCK)
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><AlertTriangle size={10} /> Критично</span>
  if (stock <= LOW_STOCK)
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><TrendingDown size={10} /> Мало</span>
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle size={10} /> В наличии</span>
}

function StockCell({ product, onUpdated }: { product: Product; onUpdated: (id: number, stock: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(product.stock))
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = () => {
    setValue(String(product.stock))
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const cancel = () => {
    setEditing(false)
    setValue(String(product.stock))
  }

  const save = async () => {
    const newStock = parseInt(value, 10)
    if (isNaN(newStock) || newStock < 0) {
      cancel()
      return
    }
    setSaving(true)
    try {
      await productsApi.updateStock(product.id, newStock)
      onUpdated(product.id, newStock)
      setEditing(false)
    } catch {
      cancel()
    } finally {
      setSaving(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') cancel()
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 justify-center">
        <input
          ref={inputRef}
          type="number"
          min={0}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={saving}
          className="w-16 text-center border border-[#004B57] rounded-lg text-sm font-bold py-0.5 outline-none focus:ring-2 focus:ring-[#004B57]/20"
        />
        <button onClick={save} disabled={saving} className="text-green-600 hover:text-green-700 p-0.5">
          <Check size={15} />
        </button>
        <button onClick={cancel} disabled={saving} className="text-gray-400 hover:text-gray-600 p-0.5">
          <X size={15} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 justify-center group">
      <span className={`text-lg font-bold ${
        product.stock === 0 ? 'text-gray-400' :
        product.stock <= CRITICAL_STOCK ? 'text-red-600' :
        product.stock <= LOW_STOCK ? 'text-amber-600' : 'text-gray-900'
      }`}>
        {product.stock}
      </span>
      <span className="text-xs text-gray-400">шт.</span>
      <button
        onClick={startEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#004B57] p-0.5"
        title="Изменить остаток"
      >
        <Pencil size={12} />
      </button>
    </div>
  )
}

export default function SellerWarehouse() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<'all' | 'low' | 'critical'>('all')

  useEffect(() => {
    productsApi.getMine()
      .then(r => setProducts(r.items))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleStockUpdated = (id: number, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p))
  }

  const critical = products.filter(p => p.stock <= CRITICAL_STOCK)
  const low      = products.filter(p => p.stock > CRITICAL_STOCK && p.stock <= LOW_STOCK)
  const ok       = products.filter(p => p.stock > LOW_STOCK)

  const visible = filter === 'critical'
    ? critical
    : filter === 'low'
    ? [...critical, ...low]
    : products

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Склад</h1>
        <p className="text-sm text-gray-400 mt-0.5">Контроль остатков товаров · нажмите на карандаш для пополнения</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Package size={15} className="text-gray-400" />
            <p className="text-xs text-gray-400">Всего позиций</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={15} className="text-amber-500" />
            <p className="text-xs text-amber-600">Мало (≤{LOW_STOCK})</p>
          </div>
          <p className="text-2xl font-bold text-amber-500">{low.length + critical.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={15} className="text-red-500" />
            <p className="text-xs text-red-600">Критично (≤{CRITICAL_STOCK})</p>
          </div>
          <p className="text-2xl font-bold text-red-500">{critical.length}</p>
        </div>
      </div>

      {/* Alert banner */}
      {(critical.length > 0 || low.length > 0) && (
        <div className={`rounded-xl p-4 flex items-start gap-3 ${critical.length > 0 ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'}`}>
          <AlertTriangle size={18} className={critical.length > 0 ? 'text-red-500 mt-0.5' : 'text-amber-500 mt-0.5'} />
          <div>
            <p className={`text-sm font-semibold ${critical.length > 0 ? 'text-red-700' : 'text-amber-700'}`}>
              {critical.length > 0
                ? `${critical.length} товар(ов) на грани окончания — пополните склад`
                : `${low.length} товар(ов) заканчивается`}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Наведите на остаток и нажмите карандаш для изменения</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filter tabs */}
        <div className="flex border-b border-gray-100 px-4">
          {[
            { key: 'all',      label: 'Все',       count: products.length },
            { key: 'low',      label: 'Мало',      count: low.length + critical.length },
            { key: 'critical', label: 'Критично',  count: critical.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`py-3.5 px-4 text-sm font-medium border-b-2 transition-colors ${
                filter === key
                  ? 'border-[#004B57] text-[#004B57]'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {label}
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">{count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {filter === 'all' ? 'Нет товаров' : 'Нет товаров в этой категории'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-3 px-5 py-2.5 bg-gray-50/70 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <div className="col-span-5">Товар</div>
              <div className="col-span-2">Категория</div>
              <div className="col-span-2 text-center">Остаток</div>
              <div className="col-span-2">Статус</div>
              <div className="col-span-1">Цена</div>
            </div>

            <div className="divide-y divide-gray-50">
              {visible
                .sort((a, b) => a.stock - b.stock)
                .map(product => (
                  <div
                    key={product.id}
                    className={`grid grid-cols-12 gap-3 px-5 py-3.5 items-center transition-colors ${
                      product.stock === 0 ? 'bg-gray-50/50' :
                      product.stock <= CRITICAL_STOCK ? 'bg-red-50/30' :
                      product.stock <= LOW_STOCK ? 'bg-amber-50/30' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="col-span-5">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name_ru}</p>
                      <p className="text-xs text-gray-400 truncate">{product.name_kz}</p>
                    </div>
                    <div className="col-span-2 text-xs text-gray-500">{product.category}</div>
                    <div className="col-span-2">
                      <StockCell product={product} onUpdated={handleStockUpdated} />
                    </div>
                    <div className="col-span-2">
                      <StockBadge stock={product.stock} />
                    </div>
                    <div className="col-span-1 text-sm font-semibold text-gray-900">
                      {(product.discount_price ?? product.price).toLocaleString('ru-KZ')} ₸
                    </div>
                  </div>
                ))}
            </div>

            <div className="px-5 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Показано {visible.length} из {products.length} позиций
                {ok.length > 0 && ` · ${ok.length} в норме`}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
