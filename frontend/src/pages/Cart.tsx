import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useUserStore } from '../store/userStore'
import ProductImage from '../components/ProductImage'

function formatPrice(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

export default function Cart() {
  const { items, removeItem, updateQuantity, total, count } = useCartStore()
  const user = useUserStore(s => s.user)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2 text-gray-700">Себет бос / Корзина пуста</h2>
        <p className="text-gray-500 mb-6">Тауарларды сатып алу үшін каталогқа өтіңіз</p>
        <Link to="/" className="btn-primary inline-block">Каталогқа / В каталог</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Себет / <span className="text-gray-500">Корзина</span>
        <span className="ml-2 text-base font-normal text-gray-500">({count()} тауар)</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {items.map(({ product, quantity }) => {
            const price = product.discount_price ?? product.price
            return (
              <div key={product.id} className="card p-4 flex gap-4">
                <ProductImage
                  src={product.image_url}
                  alt={product.name_ru}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  iconSize={24}
                />
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${product.id}`} className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2">
                    {product.name_ru}
                  </Link>
                  <p className="text-sm text-gray-400">{product.category}</p>
                  <p className="font-bold text-blue-600 mt-1">{formatPrice(price)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => removeItem(product.id)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">−</button>
                    <span className="px-3 text-sm font-semibold">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">+</button>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{formatPrice(price * quantity)}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-72">
          <div className="card p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-4">Жиынтық / Итого</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Тауарлар ({count()}):</span>
                <span>{formatPrice(total())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Жеткізу / Доставка:</span>
                <span className="text-green-600">Тегін / Бесплатно</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Барлығы / Итого:</span>
                <span className="text-blue-600">{formatPrice(total())}</span>
              </div>
            </div>
            <button
              onClick={() => user ? navigate('/checkout') : navigate('/login')}
              className="btn-primary w-full"
            >
              Тапсырыс беру / Оформить заказ
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
