import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Truck, ShieldCheck, RotateCcw, Headphones, TrendingUp, Zap } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import RecommendationCard from '../components/RecommendationCard'
import CategoryGrid from '../components/CategoryGrid'
import { productsApi } from '../api/products'
import { recsApi } from '../api/recommendations'
import type { Product, Recommendation } from '../api/types'
import { useUserStore } from '../store/userStore'

const TRUST = [
  { icon: Truck,        text: 'Бесплатная доставка',  sub: 'от 5 000 ₸'        },
  { icon: ShieldCheck,  text: 'Гарантия качества',    sub: '30 дней возврат'    },
  { icon: RotateCcw,    text: 'Лёгкий возврат',       sub: 'без вопросов'       },
  { icon: Headphones,   text: 'Поддержка 24/7',       sub: 'всегда на связи'    },
]

export default function Home() {
  const user = useUserStore(s => s.user)
  const [popular, setPopular]   = useState<Product[]>([])
  const [recs, setRecs]         = useState<Recommendation[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      productsApi.list({ sort: 'popular', limit: 8 }),
      user ? recsApi.forUser(user.id, 8) : recsApi.popular(8),
    ])
      .then(([popRes, recsRes]) => { setPopular(popRes.items); setRecs(recsRes) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#004B57] via-[#006070] to-[#00414C] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-white/10">
              <Zap size={12} className="text-[#F5A623]" /> ML-рекомендации на основе ваших предпочтений
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
              Ақылды дүкен<br />
              <span className="text-[#F5A623]">QOLDA</span>
            </h1>
            <p className="text-white/70 text-base md:text-lg mb-8 max-w-md">
              Маркетплейс нового поколения с персональными рекомендациями на основе машинного обучения.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link
                to="/category/Electronics"
                className="bg-[#F5A623] hover:bg-[#e09520] text-white font-bold px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
              >
                Сатып ала бастау <TrendingUp size={16} />
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors border border-white/20"
                >
                  Тіркелу / Регистрация
                </Link>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            {[
              { value: '10 000+', label: 'Товаров' },
              { value: '500+',    label: 'Продавцов' },
              { value: '50 000+', label: 'Покупателей' },
              { value: '99%',     label: 'Довольных' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/10 rounded-2xl p-5 text-center border border-white/10">
                <p className="text-2xl font-black text-[#F5A623]">{value}</p>
                <p className="text-xs text-white/70 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {TRUST.map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex items-center gap-3 py-4 px-6">
                <div className="w-9 h-9 bg-[#004B57]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-[#004B57]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{text}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Categories */}
        <CategoryGrid />

        {/* Popular Products */}
        <section className="py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Танымал тауарлар</h2>
              <p className="text-sm text-gray-400 mt-0.5">Популярные товары</p>
            </div>
            <Link
              to="/category/Electronics"
              className="text-sm font-semibold text-[#004B57] hover:text-[#003840] flex items-center gap-1"
            >
              Барлығы →
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse" />
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
          <section className="py-10">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user ? 'Сізге ұсынылады' : 'Танымал'}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {user ? 'Рекомендуется для вас' : 'Популярное'}
                </p>
              </div>
              {user && (
                <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-100">
                  <Zap size={11} /> ML · Hybrid (SVD + TF-IDF)
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recs.map(r => <RecommendationCard key={r.product.id} rec={r} />)}
            </div>
          </section>
        )}

        {/* CTA banner */}
        {!user && (
          <section className="mt-6 mb-4">
            <div className="bg-gradient-to-r from-[#004B57] to-[#006070] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-white text-center md:text-left">
                <h3 className="text-xl font-bold mb-1">Продавайте на QOLDA</h3>
                <p className="text-white/70 text-sm">Откройте свой магазин и начните зарабатывать уже сегодня</p>
              </div>
              <Link
                to="/register"
                className="bg-[#F5A623] hover:bg-[#e09520] text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap flex-shrink-0"
              >
                Начать продавать →
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
