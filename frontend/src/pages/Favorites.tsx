import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { useWishlistStore } from '../store/wishlistStore'
import { useCartStore } from '../store/cartStore'
import { toast } from '../store/toastStore'
import ProductImage from '../components/ProductImage'

function formatPrice(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

export default function Favorites() {
  const { items, remove } = useWishlistStore()
  const addItem = useCartStore(s => s.addItem)

  const handleAddToCart = (product: typeof items[0]) => {
    addItem(product)
    toast.success(`«${product.name_ru}» себетке қосылды`)
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <Heart size={32} className="text-red-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Таңдаулылар бос</h2>
        <p className="text-gray-400 text-sm mb-6">
          Ұнаған тауарларды жүрекше белгіп, осы жерде сақтаңыз
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#004B57] hover:bg-[#003840] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <ShoppingBag size={16} /> Каталогқа / В каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Таңдаулылар / Избранное</h1>
        <span className="bg-red-50 text-red-500 text-sm font-semibold px-2.5 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(product => {
          const price = product.discount_price ?? product.price
          const discountPct = product.discount_price
            ? Math.round((1 - product.discount_price / product.price) * 100)
            : null
          return (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
              <Link to={`/product/${product.id}`} className="relative block">
                <ProductImage
                  src={product.image_url}
                  alt={product.name_ru}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  iconSize={36}
                />
                {discountPct && discountPct > 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    -{discountPct}%
                  </span>
                )}
                <button
                  onClick={e => { e.preventDefault(); remove(product.id); toast.info('Таңдаулылардан жойылды') }}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Heart size={15} className="fill-red-500" />
                </button>
              </Link>

              <div className="p-4">
                <p className="text-xs text-[#004B57]/60 font-medium mb-1">{product.category}</p>
                <Link
                  to={`/product/${product.id}`}
                  className="text-sm font-semibold text-gray-900 hover:text-[#004B57] line-clamp-2 leading-snug transition-colors"
                >
                  {product.name_ru}
                </Link>

                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="font-bold text-gray-900">{formatPrice(price)}</span>
                    {product.discount_price && (
                      <span className="text-xs text-gray-400 line-through ml-1.5">{formatPrice(product.price)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { remove(product.id); toast.info('Таңдаулылардан жойылды') }}
                      className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors border border-gray-100 rounded-lg"
                    >
                      <Trash2 size={13} />
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="flex items-center gap-1.5 bg-[#004B57] hover:bg-[#003840] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
                    >
                      <ShoppingBag size={13} /> Себет
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
