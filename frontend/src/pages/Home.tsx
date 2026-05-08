import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import RecommendationCard from '../components/RecommendationCard'
import CategoryGrid from '../components/CategoryGrid'
import { productsApi } from '../api/products'
import { recsApi } from '../api/recommendations'
import type { Product, Recommendation } from '../api/types'
import { useUserStore } from '../store/userStore'

export default function Home() {
  const user = useUserStore(s => s.user)
  const [popular, setPopular] = useState<Product[]>([])
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [popRes, recsRes] = await Promise.all([
          productsApi.list({ sort: 'popular', limit: 8 }),
          user ? recsApi.forUser(user.id, 8) : recsApi.popular(8),
        ])
        setPopular(popRes.items)
        setRecs(recsRes)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6 md:p-10 mb-10">
        <div className="max-w-lg">
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3">
            Ақылды дүкен<br />
            <span className="text-amber-300">QOLDA</span>
          </h1>
          <p className="text-blue-100 mb-6 text-sm md:text-lg">
            Машиналық оқыту алгоритмдері арқылы сізге ең керекті тауарларды ұсынамыз.
          </p>
          <Link to="/category/Electronics" className="bg-amber-400 hover:bg-amber-300 text-blue-900 font-bold px-4 md:px-6 py-2.5 md:py-3 rounded-xl transition-colors inline-block text-sm md:text-base">
            Сатып ала бастау →
          </Link>
        </div>
        <div className="absolute right-8 bottom-4 text-8xl opacity-20 select-none hidden sm:block">🛍️</div>
      </div>

      {/* Categories */}
      <CategoryGrid />

      {/* Popular Products */}
      <section className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Танымал тауарлар / <span className="text-gray-500">Популярные товары</span>
          </h2>
          <Link to="/category/Electronics" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Барлығы →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-72 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popular.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ML Recommendations */}
      {recs.length > 0 && (
        <section className="py-8">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {user ? 'Сізге ұсынылады' : 'Танымал'} / <span className="text-gray-500">{user ? 'Рекомендуется для вас' : 'Популярное'}</span>
            </h2>
            {user && (
              <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                🤖 ML
              </span>
            )}
          </div>
          {user && (
            <p className="text-sm text-gray-500 mb-4">
              Гибридтік ML моделі негізінде: Collaborative Filtering (SVD) + Content-Based (TF-IDF)
            </p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recs.map(r => <RecommendationCard key={r.product.id} rec={r} />)}
          </div>
        </section>
      )}
    </div>
  )
}
