import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Zap, ShoppingBag, Edit2, Check, X } from 'lucide-react'
import type { Recommendation } from '../api/types'
import { recsApi } from '../api/recommendations'
import { authApi } from '../api/auth'
import { useUserStore } from '../store/userStore'
import { toast } from '../store/toastStore'
import RecommendationCard from '../components/RecommendationCard'

export default function Profile() {
  const { user, setAuth }     = useUserStore()
  const [recs, setRecs]       = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  const [editing, setEditing]   = useState(false)
  const [name, setName]         = useState(user?.name ?? '')
  const [email, setEmail]       = useState(user?.email ?? '')
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    if (!user) return
    setName(user.name)
    setEmail(user.email)
    recsApi.forUser(user.id, 16)
      .then(setRecs)
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  const initials = user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const updated = await authApi.updateMe({ name: name.trim(), email: email.trim() })
      const token = localStorage.getItem('token') ?? ''
      setAuth(updated, token)
      setEditing(false)
      toast.success('Профиль сақталды / Профиль сохранён')
    } catch {
      toast.error('Сақтау қатесі / Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setName(user.name)
    setEmail(user.email)
    setEditing(false)
  }

  const methodCounts = recs.reduce<Record<string, number>>((acc, r) => {
    acc[r.method] = (acc[r.method] || 0) + 1
    return acc
  }, {})

  const METHOD_COLORS: Record<string, string> = {
    collaborative: 'bg-purple-100 text-purple-700',
    content_based: 'bg-[#004B57]/10 text-[#004B57]',
    popular:       'bg-amber-100 text-amber-700',
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero card */}
      <div className="bg-gradient-to-br from-[#004B57] to-[#006070] rounded-2xl p-6 md:p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 text-white text-2xl flex items-center justify-center font-bold flex-shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <input
                  className="bg-white/15 border border-white/20 text-white placeholder-white/50 rounded-lg px-3 py-1.5 text-sm w-full max-w-xs focus:outline-none focus:border-white/40"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Имя"
                />
                <input
                  type="email"
                  className="bg-white/15 border border-white/20 text-white placeholder-white/50 rounded-lg px-3 py-1.5 text-sm w-full max-w-xs focus:outline-none focus:border-white/40"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                />
              </div>
            ) : (
              <>
                <h1 className="text-xl md:text-2xl font-bold">{user.name}</h1>
                <p className="text-white/60 text-sm mt-0.5">{user.email}</p>
                <p className="text-white/40 text-xs mt-1">
                  Тіркелген: {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  {user.is_seller && <span className="ml-2 bg-[#F5A623]/20 text-[#F5A623] text-xs px-2 py-0.5 rounded-full font-medium">Продавец</span>}
                  {user.is_admin  && <span className="ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">Admin</span>}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors"
                >
                  <Check size={14} /> {saving ? '...' : 'Сохранить'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white/70 text-sm px-3 py-2 rounded-xl transition-colors"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors border border-white/10"
                >
                  <Edit2 size={14} /> Редактировать
                </button>
                <Link
                  to="/orders"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors border border-white/10"
                >
                  <Package size={15} />
                  Тапсырыстарым
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ML Recommendations */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Менің рекомендацияларым</h2>
            <p className="text-sm text-gray-400 mt-0.5">Мои персональные рекомендации</p>
          </div>
          <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-100 w-fit">
            <Zap size={11} /> ML · Hybrid (SVD + TF-IDF)
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-5">
          Collaborative Filtering (SVD) + Content-Based Filtering (TF-IDF) гибридтік моделі негізінде жасалған ұсыныстар
        </p>

        {recs.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {Object.entries(methodCounts).map(([method, count]) => (
              <span
                key={method}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${METHOD_COLORS[method] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {method.replace('_', ' ')} · {count}
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recs.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
            <ShoppingBag size={40} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium text-gray-500">Рекомендациялар жоқ</p>
            <p className="text-sm text-gray-400 mt-1">
              Сатып алыңыз — ML-жүйе сізге ұқсас тауарларды ұсынады
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 mt-5 bg-[#004B57] hover:bg-[#003840] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <ShoppingBag size={15} /> Дүкенге / В магазин
            </Link>
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
