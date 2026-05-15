import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import type { Recommendation } from '../api/types'
import StarRating from './StarRating'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useUserStore } from '../store/userStore'
import { toast } from '../store/toastStore'
import { recsApi } from '../api/recommendations'
import ProductImage from './ProductImage'

interface Props {
  rec: Recommendation
}

function formatPrice(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

const METHOD_COLORS: Record<string, string> = {
  collaborative: 'bg-purple-100 text-purple-700',
  content_based: 'bg-[#004B57]/10 text-[#004B57]',
  hybrid:        'bg-indigo-100 text-indigo-700',
  popular:       'bg-green-100 text-green-700',
}

export default function RecommendationCard({ rec }: Props) {
  const { product, reason_tag, method, score } = rec
  const addItem           = useCartStore(s => s.addItem)
  const { toggle, has }   = useWishlistStore()
  const user              = useUserStore(s => s.user)
  const wished            = has(product.id)

  const handleClick = () => {
    if (user) recsApi.logClick(user.id, product.id, method).catch(() => {})
  }

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    toast.success(`«${product.name_ru}» себетке қосылды`)
  }

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault()
    toggle(product)
    if (!wished) toast.success('Таңдаулыларға қосылды')
    else         toast.info('Таңдаулылардан жойылды')
  }

  return (
    <div className="card group flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
      {/* ML badge */}
      <span className={`absolute top-2 left-2 z-10 text-xs font-semibold px-2 py-0.5 rounded-full ${METHOD_COLORS[method] ?? 'bg-gray-100 text-gray-600'}`}>
        ✦ {reason_tag}
      </span>

      <Link to={`/product/${product.id}`} onClick={handleClick} className="relative block overflow-hidden bg-gray-50">
        <ProductImage
          src={product.image_url}
          alt={product.name_ru}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 pt-8"
          iconSize={36}
        />
        <button
          onClick={handleWish}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all ${
            wished
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart size={13} className={wished ? 'fill-white' : ''} />
        </button>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-1">{product.category}</p>
        <Link
          to={`/product/${product.id}`}
          onClick={handleClick}
          className="text-sm font-semibold text-gray-900 hover:text-[#004B57] line-clamp-2 flex-1 mb-2 leading-snug transition-colors"
        >
          {product.name_ru}
        </Link>

        <StarRating rating={product.avg_rating} size="sm" showValue reviewCount={product.review_count} />

        <div className="mt-3 flex items-center justify-between gap-2">
          <div>
            {product.discount_price ? (
              <div>
                <span className="font-bold text-gray-900">{formatPrice(product.discount_price)}</span>
                <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.price)}</span>
              </div>
            ) : (
              <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
            )}
          </div>
          <button
            onClick={handleCart}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 bg-[#004B57] hover:bg-[#003840] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
          >
            <ShoppingCart size={13} />
            <span className="hidden sm:inline">Себет</span>
          </button>
        </div>

        {/* ML confidence */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex-1 bg-gray-100 rounded-full h-1">
            <div className="bg-[#004B57]/40 h-1 rounded-full" style={{ width: `${Math.round(score * 100)}%` }} />
          </div>
          <span className="text-[10px] text-gray-400 font-medium">{Math.round(score * 100)}%</span>
        </div>
      </div>
    </div>
  )
}
