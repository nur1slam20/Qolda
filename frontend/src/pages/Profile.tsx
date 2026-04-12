import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Recommendation } from '../api/types'
import { recsApi } from '../api/recommendations'
import { useUserStore } from '../store/userStore'
import RecommendationCard from '../components/RecommendationCard'

export default function Profile() {
  const user = useUserStore(s => s.user)
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    recsApi.forUser(user.id, 16)
      .then(setRecs)
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  const methodCounts = recs.reduce<Record<string, number>>((acc, r) => {
    acc[r.method] = (acc[r.method] || 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* User info card */}
      <div className="card p-6 mb-8 flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl flex items-center justify-center font-bold flex-shrink-0">
          {user.name[0]}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            Тіркелген / Зарегистрирован: {new Date(user.created_at).toLocaleDateString('ru-RU')}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/orders" className="btn-secondary text-sm">
            📦 Тапсырыстарым
          </Link>
        </div>
      </div>

      {/* ML Recommendations */}
      <section>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            Менің рекомендацияларым / <span className="text-gray-500">Мои рекомендации</span>
          </h2>
          <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
            🤖 Hybrid ML
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Сізге арналған рекомендациялар — Collaborative Filtering (SVD) + Content-Based Filtering (TF-IDF) гибридтік моделі негізінде жасалған.
        </p>

        {/* Method distribution */}
        {recs.length > 0 && (
          <div className="flex gap-3 mb-6 flex-wrap">
            {Object.entries(methodCounts).map(([method, count]) => (
              <div key={method} className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                <span className="font-semibold capitalize">{method.replace('_', ' ')}</span>
                <span className="text-gray-500 ml-1">({count})</span>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-72 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : recs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🛍️</div>
            <p>Рекомендациялар жасалу үшін тауарлар сатып алыңыз</p>
            <p className="text-sm mt-1">Купите товары, чтобы получить персональные рекомендации</p>
            <Link to="/" className="btn-primary inline-block mt-4">Сатып алуға / В магазин</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recs.map(r => <RecommendationCard key={r.product.id} rec={r} />)}
          </div>
        )}
      </section>
    </div>
  )
}
