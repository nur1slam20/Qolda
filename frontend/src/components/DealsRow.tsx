import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Leaf, ShoppingCart } from 'lucide-react'
import { productsApi } from '../api/products'
import type { Product } from '../api/types'
import { useCartStore } from '../store/cartStore'
import { toast } from '../store/toastStore'
import ProductImage from './ProductImage'

function MiniCard({ product, accent }: { product: Product; accent: string }) {
  const addItem = useCartStore(s => s.addItem)
  const pct = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : 0

  return (
    <div className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-2.5 transition-all group cursor-pointer">
      <Link to={`/product/${product.id}`} className="flex-shrink-0">
        <ProductImage
          src={product.image_url}
          alt={product.name_ru}
          className="w-14 h-14 object-cover rounded-lg group-hover:scale-105 transition-transform"
          iconSize={20}
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/product/${product.id}`}>
          <p className="text-white text-xs font-semibold line-clamp-2 leading-snug hover:text-yellow-300 transition-colors">
            {product.name_ru}
          </p>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-yellow-300 font-black text-sm">
            {(product.discount_price ?? product.price).toLocaleString()} ₸
          </span>
          {pct > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${accent}`}>
              -{pct}%
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => { addItem(product); toast.success('Добавлено') }}
        className="flex-shrink-0 w-8 h-8 bg-white/20 hover:bg-yellow-400 rounded-lg flex items-center justify-center transition-colors"
      >
        <ShoppingCart size={13} className="text-white" />
      </button>
    </div>
  )
}

export default function DealsRow() {
  const [sale, setSale]       = useState<Product[]>([])
  const [seasonal, setSeasonal] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    productsApi.list({ limit: 50 }).then(res => {
      const all = res.items
      // Акция — товары со скидкой, сортируем по % скидки
      const discounted = all
        .filter(p => p.discount_price && p.discount_price < p.price)
        .sort((a, b) => {
          const pa = (1 - (a.discount_price ?? a.price) / a.price)
          const pb = (1 - (b.discount_price ?? b.price) / b.price)
          return pb - pa
        })
        .slice(0, 4)
      // Выгодные сезонные — топ по рейтингу из Clothing/Sports/Home
      const seasonal = all
        .filter(p => ['Clothing', 'Sports', 'Home'].includes(p.category))
        .sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))
        .slice(0, 4)
      setSale(discounted)
      setSeasonal(seasonal.length >= 2 ? seasonal : all.sort((a,b) => (b.avg_rating??0)-(a.avg_rating??0)).slice(0,4))
    }).finally(() => setLoading(false))
  }, [])

  const skeleton = (
    <div className="space-y-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 bg-white/10 rounded-xl animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">

      {/* ── LEFT: Акция ── */}
      <div className="bg-gradient-to-br from-rose-600 via-red-500 to-orange-500 rounded-2xl p-5 relative overflow-hidden">
        {/* Декор */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full blur-xl" />

        <div className="relative">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-yellow-300 animate-bounce" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg leading-none">Акция</h3>
                <p className="text-white/60 text-xs">Лучшие скидки</p>
              </div>
            </div>
            <Link
              to="/search?sale=1"
              className="text-white/70 hover:text-white text-xs font-semibold underline underline-offset-2 transition-colors"
            >
              Все →
            </Link>
          </div>

          {/* Карточки */}
          <div className="space-y-2.5">
            {loading ? skeleton : sale.map(p => (
              <MiniCard key={p.id} product={p} accent="bg-red-700 text-white" />
            ))}
          </div>

          {/* CTA */}
          <Link
            to="/search?sale=1"
            className="mt-4 flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold text-sm py-2.5 rounded-xl transition-colors w-full border border-white/20"
          >
            <Zap size={14} /> Все акции
          </Link>
        </div>
      </div>

      {/* ── RIGHT: Выгодные / Сезонные ── */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 rounded-2xl p-5 relative overflow-hidden">
        {/* Декор */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-black/10 rounded-full blur-xl" />

        <div className="relative">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Leaf size={16} className="text-green-200 animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg leading-none">Выгодные</h3>
                <p className="text-white/60 text-xs">Сезонные товары</p>
              </div>
            </div>
            <Link
              to="/category/Clothing"
              className="text-white/70 hover:text-white text-xs font-semibold underline underline-offset-2 transition-colors"
            >
              Все →
            </Link>
          </div>

          {/* Карточки */}
          <div className="space-y-2.5">
            {loading ? skeleton : seasonal.map(p => (
              <MiniCard key={p.id} product={p} accent="bg-emerald-700 text-white" />
            ))}
          </div>

          {/* CTA */}
          <Link
            to="/category/Sports"
            className="mt-4 flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold text-sm py-2.5 rounded-xl transition-colors w-full border border-white/20"
          >
            <Leaf size={14} /> Сезонные товары
          </Link>
        </div>
      </div>

    </div>
  )
}
