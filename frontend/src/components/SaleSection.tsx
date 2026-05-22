import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Zap, ShoppingCart, Heart } from 'lucide-react'
import { productsApi } from '../api/products'
import type { Product } from '../api/types'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { toast } from '../store/toastStore'
import ProductImage from './ProductImage'
import { useT } from '../utils/i18n'

function useCountdown(targetMs: number) {
  const [diff, setDiff] = useState(targetMs - Date.now())
  useEffect(() => {
    const id = setInterval(() => setDiff(targetMs - Date.now()), 1000)
    return () => clearInterval(id)
  }, [targetMs])
  const total = Math.max(0, diff)
  const h = Math.floor(total / 3_600_000)
  const m = Math.floor((total % 3_600_000) / 60_000)
  const s = Math.floor((total % 60_000) / 1000)
  return { h, m, s }
}

function Pad({ n }: { n: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-1.5 min-w-[42px] text-center">
        <span className="text-xl font-black tabular-nums">{String(n).padStart(2, '0')}</span>
      </div>
    </div>
  )
}

function SaleCard({ product }: { product: Product }) {
  const addItem = useCartStore(s => s.addItem)
  const { toggle, has } = useWishlistStore()
  const wished = has(product.id)
  const t = useT()

  const pct = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : 0

  return (
    <div className="relative flex-shrink-0 w-52 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-2xl">
      {/* Discount badge */}
      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full flex items-center gap-1">
        <Zap size={10} /> -{pct}%
      </div>

      {/* Wishlist */}
      <button
        onClick={() => { toggle(product); toast.success(wished ? 'Удалено' : 'В избранное') }}
        className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
          wished ? 'bg-red-500 text-white' : 'bg-white/20 text-white/70 hover:bg-white/40'
        }`}
      >
        <Heart size={13} className={wished ? 'fill-white' : ''} />
      </button>

      <Link to={`/product/${product.id}`}>
        <ProductImage
          src={product.image_url}
          alt={product.name_ru}
          className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
          iconSize={32}
        />
      </Link>

      <div className="p-3">
        <Link to={`/product/${product.id}`}>
          <p className="text-white text-xs font-semibold line-clamp-2 leading-snug mb-2 hover:text-[#F5A623] transition-colors">
            {product.name_ru}
          </p>
        </Link>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[#F5A623] font-black text-base leading-none">
              {product.discount_price?.toLocaleString()} ₸
            </p>
            <p className="text-white/40 text-xs line-through mt-0.5">
              {product.price.toLocaleString()} ₸
            </p>
          </div>
          <button
            onClick={() => { addItem(product); toast.success('Добавлено в корзину') }}
            disabled={product.stock === 0}
            className="flex items-center gap-1 bg-[#F5A623] hover:bg-[#e09520] disabled:opacity-40 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            <ShoppingCart size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SaleSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]  = useState(true)
  const [idx, setIdx]          = useState(0)
  const scrollRef              = useRef<HTMLDivElement>(null)

  // countdown: next midnight
  const target = useRef(Date.now() + 6 * 3_600_000 + 23 * 60_000)
  const { h, m, s } = useCountdown(target.current)

  useEffect(() => {
    productsApi.list({ limit: 50 })
      .then(res => {
        const sale = res.items.filter(p => p.discount_price && p.discount_price < p.price)
        setProducts(sale.slice(0, 16))
      })
      .finally(() => setLoading(false))
  }, [])

  const VISIBLE = 4
  const maxIdx  = Math.max(0, products.length - VISIBLE)

  function scroll(dir: 'left' | 'right') {
    const next = dir === 'right'
      ? Math.min(idx + 1, maxIdx)
      : Math.max(idx - 1, 0)
    setIdx(next)
    scrollRef.current?.scrollTo({ left: next * 216, behavior: 'smooth' })
  }

  if (!loading && products.length === 0) return null

  return (
    <section className="py-10">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 rounded-2xl p-6 mb-6 relative overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={18} className="text-yellow-300 animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">Flash Sale</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black">Товары по акции</h2>
            <p className="text-white/70 text-sm mt-1">Скидки до 70% — только сегодня!</p>
          </div>

          {/* Countdown */}
          <div className="text-white flex-shrink-0">
            <p className="text-xs text-white/70 text-center mb-2 font-medium">Осталось времени</p>
            <div className="flex items-center gap-1.5">
              <Pad n={h} />
              <span className="text-xl font-black animate-pulse">:</span>
              <Pad n={m} />
              <span className="text-xl font-black animate-pulse">:</span>
              <Pad n={s} />
            </div>
            <div className="flex justify-around mt-1 text-white/50 text-[10px]">
              <span>часов</span><span>минут</span><span>секунд</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mt-4">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-300 rounded-full transition-all duration-1000"
              style={{ width: `${100 - (h / 6) * 100}%` }}
            />
          </div>
          <p className="text-white/60 text-xs mt-1">Разобрано 67% товаров</p>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Arrow left */}
        <button
          onClick={() => scroll('left')}
          disabled={idx === 0}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center disabled:opacity-30 hover:scale-110 transition-all"
        >
          <ChevronLeft size={18} className="text-gray-700 dark:text-gray-200" />
        </button>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-52 h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-hidden scroll-smooth"
            style={{ scrollBehavior: 'smooth' }}
          >
            {products.map((p, i) => (
              <div
                key={p.id}
                style={{
                  transitionDelay: `${i * 40}ms`,
                  opacity: 1,
                  transform: 'translateY(0)',
                }}
              >
                <SaleCard product={p} />
              </div>
            ))}
          </div>
        )}

        {/* Arrow right */}
        <button
          onClick={() => scroll('right')}
          disabled={idx >= maxIdx}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center disabled:opacity-30 hover:scale-110 transition-all"
        >
          <ChevronRight size={18} className="text-gray-700 dark:text-gray-200" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-4">
        {Array.from({ length: maxIdx + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => { setIdx(i); scrollRef.current?.scrollTo({ left: i * 216, behavior: 'smooth' }) }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === idx ? 'bg-red-500 w-6' : 'bg-gray-300 dark:bg-gray-700 w-1.5'
            }`}
          />
        ))}
      </div>

      {/* See all link */}
      <div className="text-center mt-6">
        <Link
          to="/search?sale=1"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all hover:scale-105 shadow-lg"
        >
          <Zap size={16} /> Все акционные товары
        </Link>
      </div>
    </section>
  )
}
