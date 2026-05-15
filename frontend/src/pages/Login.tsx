import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, ShieldCheck, TrendingUp } from 'lucide-react'
import { authApi } from '../api/auth'
import { useUserStore } from '../store/userStore'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const setAuth  = useUserStore(s => s.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authApi.login(email, password)
      setAuth(data.user, data.access_token)
      navigate(data.user.is_seller ? '/seller/dashboard' : '/')
    } catch {
      setError('Электрондық пошта немесе құпиясөз қате')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#004B57] via-[#006070] to-[#00414C] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-lg">Q</span>
          </div>
          <span className="text-white font-black text-2xl tracking-tight">QOLDA</span>
        </div>

        <div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Ақылды<br />маркетплейс
          </h2>
          <p className="text-white/60 text-lg mb-10">
            ML-рекомендациялар негізіндегі персонализацияланған сауда платформасы
          </p>
          <div className="space-y-4">
            {[
              { icon: Zap,         text: 'Hybrid ML рекомендациялары (SVD + TF-IDF)' },
              { icon: ShieldCheck, text: 'Қауіпсіз транзакциялар және деректер' },
              { icon: TrendingUp,  text: '10 000+ тауар, 500+ сатушы' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/80">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={15} />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">© 2026 QOLDA — Дипломдық жоба</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#004B57] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">Q</span>
            </div>
            <span className="font-black text-xl text-gray-900">QOLDA</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Жүйеге кіру</h1>
            <p className="text-gray-500 mt-1 text-sm">Войдите в свой аккаунт</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Электрондық пошта / Email
              </label>
              <input
                type="email"
                required
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Құпиясөз / Пароль
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  className="input pr-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#004B57] hover:bg-[#003840] text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              {loading ? 'Кірілуде...' : 'Кіру / Войти'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Аккаунтыңыз жоқ па?{' '}
            <Link to="/register" className="text-[#004B57] hover:text-[#003840] font-semibold">
              Тіркелу / Регистрация
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-[#004B57]/5 border border-[#004B57]/10 rounded-xl text-xs space-y-1 text-gray-500">
            <p className="font-semibold text-gray-700 mb-1.5">Демо аккаунттар:</p>
            <p><span className="font-medium text-gray-700">Покупатель:</span> aidar@example.com / password123</p>
            <p><span className="font-medium text-gray-700">Admin:</span> admin@shopai.kz / admin123</p>
            <p className="text-gray-400">Продавец: зарегистрируйтесь как "Продавец"</p>
          </div>
        </div>
      </div>
    </div>
  )
}
