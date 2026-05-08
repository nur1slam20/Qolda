import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productsApi } from '../../api/products'
import type { Product } from '../../api/types'
import ProductImage from '../../components/ProductImage'

function formatPrice(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

export default function SellerProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    productsApi.getMine()
      .then(data => setProducts(data.items))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" жойылсын ба? / Удалить "${name}"?`)) return
    setDeletingId(id)
    try {
      await productsApi.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch {
      alert('Жою мүмкін болмады / Не удалось удалить')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Менің тауарларым</h1>
          <p className="text-gray-500 text-sm">Мои товары</p>
        </div>
        <Link to="/seller/add-product" className="btn-primary">
          + Тауар қосу / Добавить
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse flex gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-500 mb-4">
            Тауарлар жоқ / Товаров пока нет
          </p>
          <Link to="/seller/add-product" className="btn-primary">
            Алғашқы тауарды қосу / Добавить первый товар
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(product => (
            <div key={product.id} className="card p-4 flex items-center gap-4">
              <ProductImage
                src={product.image_url}
                alt={product.name_ru}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                iconSize={24}
              />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{product.name_ru}</p>
                <p className="text-gray-500 text-sm">{product.category}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="font-medium text-blue-600">
                    {formatPrice(product.discount_price ?? product.price)}
                  </span>
                  {product.discount_price && (
                    <span className="text-gray-400 line-through text-sm">
                      {formatPrice(product.price)}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.stock > 0 ? `Қорда: ${product.stock}` : 'Қорда жоқ'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="text-xs btn-secondary px-3 py-1.5"
                >
                  Көру
                </button>
                <button
                  onClick={() => handleDelete(product.id, product.name_ru)}
                  disabled={deletingId === product.id}
                  className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1.5 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                >
                  {deletingId === product.id ? '...' : 'Жою'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="mt-4 text-center">
          <Link to="/seller/add-product" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            + Тауар қосу / Добавить ещё товар
          </Link>
        </div>
      )}
    </div>
  )
}
