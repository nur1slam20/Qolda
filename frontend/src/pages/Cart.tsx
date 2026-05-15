import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useUserStore } from '../store/userStore'
import ProductImage from '../components/ProductImage'

function formatPrice(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

export default function Cart() {
  const { items, removeItem, updateQuantity, total, count } = useCartStore()
  const user     = useUserStore(s => s.user)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <ShoppingCart size={32} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Себет бос / Корзина пуста</h2>
        <p className="text-gray-400 text-sm mb-6">Тауарларды сатып алу үшін каталогқа өтіңіз</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Себет / Корзина</h1>
        <span className="bg-[#004B57]/10 text-[#004B57] text-sm font-semibold px-2.5 py-0.5 rounded-full">
          {count()}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Items */}
        <div className="flex-1 space-y-3">
          {items.map(({ product, quantity }) => {
            const price = product.discount_price ?? product.price
            return (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">
                <Link to={`/product/${product.id}`} className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
                    <ProductImage
                      src={product.image_url}
                      alt={product.name_ru}
                      className="w-full h-full object-cover"
                      iconSize={24}
                    />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${product.id}`}
                    className="font-semibold text-gray-900 hover:text-[#004B57] line-clamp-2 text-sm leading-snug transition-colors"
                  >
                    {product.name_ru}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-[#004B57] text-sm">{formatPrice(price)}</span>
                    {product.discount_price && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between gap-2">
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 size={15} />
                  </button>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-base"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-gray-900">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-base"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-bold text-gray-800">{formatPrice(price * quantity)}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-72">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Жиынтық / Итого</h3>
            <div className="space-y-2.5 text-sm mb-5">
              <div className="flex justify-between text-gray-600">
                <span>Тауарлар ({count()}):</span>
                <span className="font-medium text-gray-900">{formatPrice(total())}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Жеткізу / Доставка:</span>
                <span className="text-green-600 font-medium">Оформлении</span>
              </div>
              <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-base">
                <span className="text-gray-900">Барлығы / Итого:</span>
                <span className="text-[#004B57]">{formatPrice(total())}</span>
              </div>
            </div>
            <button
              onClick={() => user ? navigate('/checkout') : navigate('/login')}
              className="w-full flex items-center justify-center gap-2 bg-[#004B57] hover:bg-[#003840] text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {user ? 'Тапсырыс беру' : 'Кіру қажет'}
              <ArrowRight size={16} />
            </button>
            {!user && (
              <p className="text-xs text-center text-gray-400 mt-2">
                Тапсырыс беру үшін кіріңіз
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
