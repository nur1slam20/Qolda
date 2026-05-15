import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, ChevronLeft, Star, Package, Heart } from 'lucide-react'
import type { Product, Review, Recommendation } from '../api/types'
import { productsApi } from '../api/products'
import { reviewsApi } from '../api/reviews'
import { recsApi } from '../api/recommendations'
import StarRating from '../components/StarRating'
import ProductCard from '../components/ProductCard'
import ProductImage from '../components/ProductImage'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useUserStore } from '../store/userStore'
import { toast } from '../store/toastStore'

function formatPrice(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

export default function ProductDetail() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const addItem           = useCartStore(s => s.addItem)
  const { toggle, has }   = useWishlistStore()
  const user              = useUserStore(s => s.user)

  const [product, setProduct]   = useState<Product | null>(null)
  const [reviews, setReviews]   = useState<Review[]>([])
  const [similar, setSimilar]   = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [qty, setQty]           = useState(1)
  const [added, setAdded]       = useState(false)

  const [showForm, setShowForm]       = useState(false)
  const [newRating, setNewRating]     = useState(5)
  const [newText, setNewText]         = useState('')
  const [submitting, setSubmitting]   = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      productsApi.get(Number(id)),
      reviewsApi.getForProduct(Number(id)),
    ]).then(([prod, revs]) => {
      setProduct(prod)
      setReviews(revs)
      return recsApi.popular(8)
    }).then((recs: Recommendation[]) => {
      setSimilar(recs.filter(r => r.product.id !== Number(id)).slice(0, 4).map(r => r.product))
    }).finally(() => setLoading(false))
  }, [id])

  const wished = product ? has(product.id) : false

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, qty)
    setAdded(true)
    toast.success(`«${product.name_ru}» себетке қосылды`)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleWish = () => {
    if (!product) return
    toggle(product)
    if (!wished) toast.success('Таңдаулыларға қосылды')
    else         toast.info('Таңдаулылардан жойылды')
  }

  const submitReview = async () => {
    if (!user || !product) return
    setSubmitting(true)
    try {
      const review = await reviewsApi.create(product.id, newRating, newText)
      setReviews(prev => [review, ...prev])
      setShowForm(false)
      setNewText('')
      setNewRating(5)
      toast.success('Пікір жіберілді / Отзыв отправлен')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg || 'Қате / Ошибка')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-24 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-6 bg-gray-200 rounded" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-24 text-gray-400">
        <Package size={48} className="mx-auto mb-4 opacity-30" />
        <p>Тауар табылмады / Товар не найден</p>
      </div>
    )
  }

  const discountPct = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : null

  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct:   reviews.length ? Math.round(reviews.filter(r => r.rating === star).length / reviews.length * 100) : 0,
  }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#004B57] transition-colors mb-7 group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Артқа / Назад
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="relative">
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <ProductImage
              src={product.image_url}
              alt={product.name_ru}
              className="w-full object-cover"
              iconSize={64}
            />
          </div>
          {discountPct && discountPct > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-[#004B57]/60 uppercase tracking-wider mb-2">
            {product.category}{product.subcategory ? ` / ${product.subcategory}` : ''}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-1">{product.name_ru}</h1>
          {product.name_kz && (
            <p className="text-sm text-gray-400 italic mb-3">{product.name_kz}</p>
          )}

          <div className="mb-4">
            <StarRating rating={product.avg_rating} size="lg" showValue reviewCount={product.review_count} />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            {product.discount_price ? (
              <>
                <span className="text-3xl font-extrabold text-[#004B57]">
                  {formatPrice(product.discount_price)}
                </span>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-3xl font-extrabold text-gray-900">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Stock */}
          <div className={`inline-flex items-center gap-1.5 text-sm font-medium mb-4 ${
            product.stock > 0 ? 'text-green-600' : 'text-red-500'
          }`}>
            <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            {product.stock > 0
              ? `Қолжетімді — ${product.stock} дана / В наличии`
              : 'Таусылды / Нет в наличии'}
          </div>

          {product.description_ru && (
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.description_ru}</p>
          )}

          {product.tags && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {product.tags.split(' ').filter(Boolean).map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Qty + cart + wishlist */}
          <div className="flex items-center gap-3 mt-auto">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-10 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium"
              >
                −
              </button>
              <span className="w-10 text-center font-semibold text-gray-900">{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-10 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-all ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-[#004B57] hover:bg-[#003840] text-white disabled:opacity-40'
              }`}
            >
              <ShoppingCart size={16} />
              {added ? 'Қосылды!' : 'Себетке / В корзину'}
            </button>
            <button
              onClick={handleWish}
              className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all flex-shrink-0 ${
                wished
                  ? 'border-red-500 bg-red-50 text-red-500'
                  : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400'
              }`}
            >
              <Heart size={18} className={wished ? 'fill-red-500' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Пікірлер / Отзывы</h2>
            <p className="text-sm text-gray-400 mt-0.5">{reviews.length} пікір / отзывов</p>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 text-sm font-semibold border border-[#004B57] text-[#004B57] hover:bg-[#004B57] hover:text-white rounded-xl transition-colors"
            >
              + Пікір қалдыру
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Бағалаңыз / Ваша оценка</h3>
            <div className="flex gap-1.5 mb-4">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setNewRating(s)}
                  className={`text-2xl transition-colors ${s <= newRating ? 'text-amber-400' : 'text-gray-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              className="input mb-4"
              rows={3}
              placeholder="Пікіріңізді жазыңыз / Напишите ваш отзыв..."
              value={newText}
              onChange={e => setNewText(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={submitReview}
                disabled={submitting}
                className="px-5 py-2 bg-[#004B57] hover:bg-[#003840] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
              >
                {submitting ? 'Жіберілуде...' : 'Жіберу / Отправить'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Болдырмау
              </button>
            </div>
          </div>
        )}

        {/* Rating summary */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="text-center flex-shrink-0">
                <div className="text-5xl font-extrabold text-gray-900">{product.avg_rating.toFixed(1)}</div>
                <StarRating rating={product.avg_rating} size="lg" />
                <div className="text-sm text-gray-400 mt-1">{reviews.length} пікір</div>
              </div>
              <div className="flex-1 w-full space-y-2">
                {ratingBreakdown.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-2.5 text-sm">
                    <span className="w-3 text-gray-500 font-medium">{star}</span>
                    <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-400 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-gray-400 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {reviews.map(r => {
            const initial = (r.user_name || 'U')[0].toUpperCase()
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#004B57] text-white text-sm flex items-center justify-center font-semibold flex-shrink-0">
                      {initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.user_name || 'Пайдаланушы'}</p>
                      <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('ru-RU')}</p>
                    </div>
                  </div>
                  <StarRating rating={r.rating} size="sm" />
                </div>
                {r.text && <p className="text-gray-600 text-sm leading-relaxed">{r.text}</p>}
              </div>
            )
          })}
          {reviews.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Star size={32} className="mx-auto mb-3 opacity-20" />
              <p>Пікірлер жоқ / Отзывов пока нет</p>
              <p className="text-sm mt-1">Бірінші болыңыз!</p>
            </div>
          )}
        </div>
      </section>

      {/* Similar products */}
      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Осыған ұқсас</h2>
          <p className="text-sm text-gray-400 mb-6">Похожие товары</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
