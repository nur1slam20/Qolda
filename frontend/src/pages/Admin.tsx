import { useEffect, useState } from 'react'
import type { AdminStats } from '../api/types'
import { adminApi } from '../api/admin'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts'

function formatPrice(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [retraining, setRetraining] = useState(false)
  const [retrainMsg, setRetrainMsg] = useState('')

  const loadStats = () => {
    setLoading(true)
    adminApi.stats()
      .then(setStats)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadStats() }, [])

  const handleRetrain = async () => {
    setRetraining(true)
    setRetrainMsg('')
    try {
      const result = await adminApi.retrain()
      setRetrainMsg(`✅ Модель қайта үйретілді! ${result.meta?.num_ratings || 0} рейтинг`)
      loadStats()
    } catch {
      setRetrainMsg('❌ Қате / Ошибка при переобучении')
    } finally {
      setRetraining(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  const meta = stats.model_meta as Record<string, string | number | boolean>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Админ панель / <span className="text-gray-500">Панель администратора</span>
        </h1>
        <button onClick={loadStats} className="btn-secondary text-sm">
          ↻ Жаңарту
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <p className="text-sm text-gray-500">Тапсырыстар / Заказы</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats.total_orders}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Табыс / Выручка</p>
          <p className="text-2xl font-extrabold text-green-600 mt-1">{formatPrice(stats.total_revenue)}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Пайдаланушылар / Пользователи</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">{stats.total_users}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Тауарлар / Товары</p>
          <p className="text-3xl font-extrabold text-purple-600 mt-1">{stats.total_products}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top products chart */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-4">
            Үздік тауарлар / Топ товаров (по продажам)
          </h2>
          {stats.top_products.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.top_products} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">Деректер жоқ / Нет данных</p>
          )}
        </div>

        {/* CTR chart */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-4">
            Рекомендация CTR / CTR рекомендаций
          </h2>
          {stats.ctr_data.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.ctr_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="shown" stroke="#3b82f6" name="Көрсетілді" dot={false} />
                <Line type="monotone" dataKey="clicked" stroke="#10b981" name="Басылды" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">
              Рекомендация деректері жоқ / Нет данных о рекомендациях
            </p>
          )}
        </div>
      </div>

      {/* ML Model Card */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-gray-900 mb-1">
              ML Моделі / ML Модель
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Hybrid Recommender (SVD 0.6 + TF-IDF 0.4)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Соңғы үйрету</p>
                <p className="font-semibold">{meta.last_trained_at ? new Date(meta.last_trained_at as string).toLocaleString('ru-RU') : '—'}</p>
              </div>
              <div>
                <p className="text-gray-400">Тауарлар</p>
                <p className="font-semibold">{meta.num_products ?? '—'}</p>
              </div>
              <div>
                <p className="text-gray-400">Пайдаланушылар</p>
                <p className="font-semibold">{meta.num_users ?? '—'}</p>
              </div>
              <div>
                <p className="text-gray-400">Рейтингтер</p>
                <p className="font-semibold">{meta.num_ratings ?? '—'}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${meta.collab_available ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {meta.collab_available ? '✓ Collaborative (SVD)' : '⚠ SVD жоқ (аз деректер)'}
              </span>
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                ✓ Content-Based (TF-IDF)
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleRetrain}
              disabled={retraining}
              className="btn-primary"
            >
              {retraining ? '⏳ Үйретілуде...' : '🔄 Модельді қайта үйрету'}
            </button>
            {retrainMsg && (
              <p className="text-sm text-gray-600 mt-1">{retrainMsg}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
