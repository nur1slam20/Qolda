import { Link } from 'react-router-dom'
import type { Recommendation } from '../api/types'
import StarRating from './StarRating'
import { useCartStore } from '../store/cartStore'
import { useUserStore } from '../store/userStore'
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
  content_based: 'bg-blue-100 text-blue-700',
  hybrid: 'bg-indigo-100 text-indigo-700',
  popular: 'bg-green-100 text-green-700',
}

export default function RecommendationCard({ rec }: Props) {
  const { product, reason_tag, method, score } = rec
  const addItem = useCartStore(s => s.addItem)
  const user = useUserStore(s => s.user)

  const handleClick = () => {
    if (user) {
      recsApi.logClick(user.id, product.id, method).catch(() => {})
    }
  }

  return (
    <div className="card group flex flex-col hover:shadow-md transition-shadow relative">
      {/* ML reason tag */}
      <div className={`absolute top-2 left-2 z-10 text-xs font-medium px-2 py-1 rounded-full ${METHOD_COLORS[method] ?? 'bg-gray-100 text-gray-600'}`}>
        ✨ {reason_tag}
      </div>

      <Link to={`/product/${product.id}`} onClick={handleClick} className="block overflow-hidden rounded-t-xl">
        <ProductImage
          src={product.image_url}
          alt={product.name_ru}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 pt-8"
          iconSize={36}
        />
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-1">{product.category}</p>
        <Link
          to={`/product/${product.id}`}
          onClick={handleClick}
          className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2 flex-1 mb-2"
        >
          {product.name_ru}
        </Link>

        <StarRating rating={product.avg_rating} size="sm" showValue reviewCount={product.review_count} />

        <div className="mt-3 flex items-center justify-between">
          <div>
            {product.discount_price ? (
              <>
                <span className="font-bold text-blue-600">{formatPrice(product.discount_price)}</span>
                <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            className="btn-primary text-sm py-1.5 px-3"
          >
            + Себет
          </button>
        </div>

        {/* ML score badge (for profile page transparency) */}
        <div className="mt-2 text-xs text-gray-400">
          ML score: {(score * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  )
}
