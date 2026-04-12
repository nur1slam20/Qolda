import { Link } from 'react-router-dom'
import type { Product } from '../api/types'
import StarRating from './StarRating'
import { useCartStore } from '../store/cartStore'
import ProductImage from './ProductImage'

interface Props {
  product: Product
}

function formatPrice(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore(s => s.addItem)

  return (
    <div className="card group flex flex-col hover:shadow-md transition-shadow">
      <Link to={`/product/${product.id}`} className="block overflow-hidden rounded-t-xl">
        <ProductImage
          src={product.image_url}
          alt={product.name_ru}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          iconSize={36}
        />
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-1">{product.category}</p>
        <Link
          to={`/product/${product.id}`}
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

        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-orange-500 mt-1">Қалды: {product.stock} дана</p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-red-500 mt-1">Таусылды / Нет в наличии</p>
        )}
      </div>
    </div>
  )
}
