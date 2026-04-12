import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { productsApi } from '../api/products'
import type { Product } from '../api/types'

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Жаңа / Новые' },
  { value: 'price_asc',  label: 'Баға ↑ / Цена ↑' },
  { value: 'price_desc', label: 'Баға ↓ / Цена ↓' },
  { value: 'rating',     label: 'Рейтинг' },
  { value: 'popular',    label: 'Танымал / Популярные' },
]

export default function Category() {
  const { name } = useParams()
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''

  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [sort, setSort] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState('')

  useEffect(() => {
    setPage(1)
  }, [name, q, sort, minPrice, maxPrice, minRating])

  useEffect(() => {
    setLoading(true)
    const fetch = q
      ? productsApi.search(q, page)
      : productsApi.list({
          category: name,
          sort,
          page,
          limit: 20,
          ...(minPrice ? { min_price: Number(minPrice) } : {}),
          ...(maxPrice ? { max_price: Number(maxPrice) } : {}),
          ...(minRating ? { min_rating: Number(minRating) } : {}),
        })

    fetch
      .then(data => {
        setProducts(data.items)
        setTotal(data.total)
        setPages(data.pages)
      })
      .finally(() => setLoading(false))
  }, [name, q, sort, minPrice, maxPrice, minRating, page])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        {q ? `Іздеу: "${q}"` : name}
        <span className="ml-3 text-base font-normal text-gray-500">{total} тауар</span>
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        {!q && (
          <aside className="w-full md:w-56 flex-shrink-0">
            <div className="card p-4 space-y-4">
              <h3 className="font-semibold text-gray-800">Сүзгілер / Фильтры</h3>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Баға / Цена (₸)
                </label>
                <div className="flex gap-2">
                  <input className="input text-sm" placeholder="мин" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                  <input className="input text-sm" placeholder="макс" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Рейтинг
                </label>
                <select className="input text-sm" value={minRating} onChange={e => setMinRating(e.target.value)}>
                  <option value="">Барлығы</option>
                  <option value="4">4★ жоғары</option>
                  <option value="3">3★ жоғары</option>
                </select>
              </div>

              <button
                className="btn-secondary w-full text-sm"
                onClick={() => { setMinPrice(''); setMaxPrice(''); setMinRating('') }}
              >
                Тазарту / Сбросить
              </button>
            </div>
          </aside>
        )}

        <div className="flex-1">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">{total} нәтиже / результатов</span>
            <select
              className="input w-auto text-sm"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card h-72 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">🔍</div>
              <p>Тауар табылмады / Товары не найдены</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    p === page ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
