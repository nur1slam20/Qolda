import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import type { Product } from '../api/types'
import StarRating from './StarRating'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { toast } from '../store/toastStore'
import ProductImage from './ProductImage'

interface Props {
  product: Product
}

function formatPrice(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

export default function ProductCard({ product }: Props) {
  const addItem  = useCartStore(s => s.addItem)
  const { toggle, has } = useWishlistStore()
  const wished   = has(product.id)

  const discountPct = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : null

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
    <div className="card group flex flex-col hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
      <Link to={`/product/${product.id}`} className="relative block overflow-hidden bg-gray-50">
        <ProductImage
          src={product.image_url}
          alt={product.name_ru}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
          iconSize={36}
        />
        {discountPct && discountPct > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discountPct}%
          </span>
        )}
        {/* Wishlist heart */}
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
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border">
              Нет в наличии
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-[#004B57]/70 font-medium mb-1">{product.category}</p>
        <Link
          to={`/product/${product.id}`}
          className="text-sm font-semibold text-gray-900 hover:text-[#004B57] line-clamp-2 flex-1 mb-2 leading-snug transition-colors"
        >
          {product.name_ru}
        </Link>

        <StarRating rating={product.avg_rating} size="sm" showValue reviewCount={product.review_count} />

        <div className="mt-3 flex items-center justify-between gap-2">
          <div>
            {product.discount_price ? (
              <div>
                <span className="font-bold text-gray-900 text-base">{formatPrice(product.discount_price)}</span>
                <span className="text-xs text-gray-400 line-through ml-1.5">{formatPrice(product.price)}</span>
              </div>
            ) : (
              <span className="font-bold text-gray-900 text-base">{formatPrice(product.price)}</span>
            )}
          </div>
          <button
            onClick={handleCart}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 bg-[#004B57] hover:bg-[#003840] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-40 flex-shrink-0"
          >
            <ShoppingCart size={13} />
            <span className="hidden sm:inline">Себет</span>
          </button>
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-orange-500 mt-1.5 font-medium">Осталось: {product.stock} шт.</p>
        )}
      </div>
    </div>
  )
}
