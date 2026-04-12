import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Product, Review, Recommendation } from '../api/types'
import { productsApi } from '../api/products'
import { reviewsApi } from '../api/reviews'
import { recsApi } from '../api/recommendations'
import StarRating from '../components/StarRating'
import ProductCard from '../components/ProductCard'
import ProductImage from '../components/ProductImage'
import { useCartStore } from '../store/cartStore'
import { useUserStore } from '../store/userStore'

function formatPrice(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addItem = useCartStore(s => s.addItem)
  const user = useUserStore(s => s.user)

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [similar, setSimilar] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newText, setNewText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      productsApi.get(Number(id)),
      reviewsApi.getForProduct(Number(id)),
    ]).then(([prod, revs]) => {
      setProduct(prod)
      setReviews(revs)
      // Load similar products via popular recs as proxy
      return recsApi.popular(8)
    }).then((recs: Recommendation[]) => {
      setSimilar(recs.filter(r => r.product.id !== Number(id)).slice(0, 4).map(r => r.product))
    }).finally(() => setLoading(false))
  }, [id])

  const submitReview = async () => {
    if (!user || !product) return
    setSubmitting(true)
    try {
      const review = await reviewsApi.create(product.id, newRating, newText)
      setReviews(prev => [review, ...prev])
      setShowReviewForm(false)
      setNewText('')
      setNewRating(5)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      alert(msg || 'Қате / Ошибка')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-80 bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-6 bg-gray-200 rounded" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!product) return <div className="text-center py-20 text-gray-400">Тауар табылмады</div>

  // Rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length ? Math.round(reviews.filter(r => r.rating === star).length / reviews.length * 100) : 0,
  }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-800 mb-6 flex items-center gap-1 text-sm">
        ← Артқа / Назад
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div>
          <ProductImage
            src={product.image_url}
            alt={product.name_ru}
            className="w-full rounded-2xl object-cover max-h-96"
            iconSize={64}
          />
        </div>

        {/* Info */}
        <div className="space-y-4">
          <p className="text-sm text-gray-400">{product.category} / {product.subcategory}</p>
          <h1 className="text-2xl font-bold text-gray-900">{product.name_ru}</h1>
          <p className="text-sm text-gray-500 italic">{product.name_kz}</p>

          <div className="flex items-center gap-3">
            <StarRating rating={product.avg_rating} size="lg" showValue reviewCount={product.review_count} />
          </div>

          <div className="flex items-baseline gap-3">
            {product.discount_price ? (
              <>
                <span className="text-3xl font-extrabold text-blue-600">{formatPrice(product.discount_price)}</span>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                <span className="bg-red-100 text-red-600 text-sm font-semibold px-2 py-0.5 rounded">
                  -{Math.round((1 - product.discount_price / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-extrabold text-gray-900">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `✓ Қолжетімді (${product.stock} дана)` : '✗ Таусылды / Нет в наличии'}
          </p>

          {product.description_ru && (
            <p className="text-gray-600 text-sm leading-relaxed">{product.description_ru}</p>
          )}

          {product.tags && (
            <div className="flex flex-wrap gap-2">
              {product.tags.split(' ').filter(Boolean).map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}

          {/* Add to cart */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg">−</button>
              <span className="px-4 py-2 font-semibold">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg">+</button>
            </div>
            <button
              onClick={() => { addItem(product, qty); navigate('/cart') }}
              disabled={product.stock === 0}
              className="btn-primary flex-1"
            >
              🛒 Себетке / В корзину
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            Пікірлер / <span className="text-gray-500">Отзывы</span>
            <span className="ml-2 text-base font-normal text-gray-500">({reviews.length})</span>
          </h2>
          {user && (
            <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn-secondary text-sm">
              + Пікір қалдыру / Написать отзыв
            </button>
          )}
        </div>

        {showReviewForm && (
          <div className="card p-6 mb-6">
            <h3 className="font-semibold mb-4">Бағалаңыз / Ваша оценка</h3>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setNewRating(s)} className={`text-2xl ${s <= newRating ? 'text-amber-400' : 'text-gray-300'}`}>★</button>
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
              <button onClick={submitReview} disabled={submitting} className="btn-primary">
                {submitting ? 'Жіберілуде...' : 'Жіберу / Отправить'}
              </button>
              <button onClick={() => setShowReviewForm(false)} className="btn-secondary">Болдырмау</button>
            </div>
          </div>
        )}

        {/* Rating breakdown */}
        {reviews.length > 0 && (
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-extrabold text-gray-900">{product.avg_rating.toFixed(1)}</div>
                <StarRating rating={product.avg_rating} size="lg" />
                <div className="text-sm text-gray-500 mt-1">{reviews.length} пікір</div>
              </div>
              <div className="flex-1 space-y-1">
                {ratingBreakdown.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-4 text-gray-600">{star}</span>
                    <span className="text-amber-400 text-xs">★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-gray-500">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-semibold">
                    {(r.user_name || 'U')[0]}
                  </div>
                  <span className="font-medium text-gray-900">{r.user_name || 'Пайдаланушы'}</span>
                </div>
                <StarRating rating={r.rating} size="sm" />
              </div>
              {r.text && <p className="text-gray-600 text-sm">{r.text}</p>}
              <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleDateString('ru-RU')}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-center text-gray-400 py-8">Пікірлер жоқ / Отзывов пока нет</p>
          )}
        </div>
      </section>

      {/* Similar products */}
      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-6">
            Осыған ұқсас / <span className="text-gray-500">Похожие товары</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
