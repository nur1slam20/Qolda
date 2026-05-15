import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productsApi } from '../api/products'
import type { Product } from '../api/types'

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Жаңа / Новые' },
  { value: 'popular',    label: 'Танымал / Популярные' },
  { value: 'price_asc',  label: 'Баға ↑ / Цена ↑' },
  { value: 'price_desc', label: 'Баға ↓ / Цена ↓' },
  { value: 'rating',     label: 'Рейтинг' },
]

const RATING_OPTIONS = [
  { value: '',  label: 'Барлығы / Все' },
  { value: '4', label: '4★ және жоғары' },
  { value: '3', label: '3★ және жоғары' },
]

export default function Category() {
  const { name }           = useParams()
  const [searchParams]     = useSearchParams()
  const q                  = searchParams.get('q') || ''

  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal]       = useState(0)
  const [pages, setPages]       = useState(1)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)

  const [sort, setSort]           = useState('newest')
  const [minPrice, setMinPrice]   = useState('')
  const [maxPrice, setMaxPrice]   = useState('')
  const [minRating, setMinRating] = useState('')

  const hasFilters = !!(minPrice || maxPrice || minRating)

  useEffect(() => { setPage(1) }, [name, q, sort, minPrice, maxPrice, minRating])

  useEffect(() => {
    setLoading(true)
    const req = q
      ? productsApi.search(q, page)
      : productsApi.list({
          category: name,
          sort,
          page,
          limit: 20,
          ...(minPrice  ? { min_price: Number(minPrice) }   : {}),
          ...(maxPrice  ? { max_price: Number(maxPrice) }   : {}),
          ...(minRating ? { min_rating: Number(minRating) } : {}),
        })

    req
      .then(data => { setProducts(data.items); setTotal(data.total); setPages(data.pages) })
      .finally(() => setLoading(false))
  }, [name, q, sort, minPrice, maxPrice, minRating, page])

  const resetFilters = () => { setMinPrice(''); setMaxPrice(''); setMinRating('') }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {q ? `Іздеу нәтижелері: "${q}"` : name}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {total} тауар табылды / найдено товаров
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        {!q && (
          <aside className="w-full md:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                  <SlidersHorizontal size={15} className="text-[#004B57]" />
                  Фильтры
                </div>
                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium"
                  >
                    <X size={12} /> Сбросить
                  </button>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Баға / Цена (₸)
                </p>
                <div className="flex gap-2">
                  <input
                    className="input text-sm"
                    placeholder="мин"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                  />
                  <input
                    className="input text-sm"
                    placeholder="макс"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Рейтинг
                </p>
                <div className="space-y-1.5">
                  {RATING_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setMinRating(opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        minRating === opt.value
                          ? 'bg-[#004B57] text-white font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <div className="flex gap-1.5 flex-wrap">
              {SORT_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => setSort(o.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sort === o.value
                      ? 'bg-[#004B57] text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-400 flex-shrink-0">{total} нәтиже</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal size={24} className="text-gray-300" />
              </div>
              <p className="font-medium text-gray-500">Тауар табылмады</p>
              <p className="text-sm mt-1">Товары не найдены — попробуйте изменить фильтры</p>
              {hasFilters && (
                <button onClick={resetFilters} className="mt-4 text-sm text-[#004B57] hover:underline font-medium">
                  Фильтрлерді тазарту / Сбросить фильтры
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ←
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-[#004B57] text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
