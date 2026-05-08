import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { authApi } from '../api/auth'
import { useUserStore } from '../store/userStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setAuth = useUserStore(s => s.setAuth)
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
      setError('Электрондық пошта немесе құпиясөз қате / Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            QOLDA
          </h1>
          <p className="text-gray-500 mt-1">Жүйеге кіру / Войти в систему</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Электрондық пошта / Email
            </label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Құпиясөз / Пароль
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="input pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Кірілуде...' : 'Кіру / Войти'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Аккаунтыңыз жоқ па?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
            Тіркелу / Регистрация
          </Link>
        </p>

        {/* Demo hint */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 space-y-0.5">
          <p><strong>Покупатель:</strong> aidar@example.com / password123</p>
          <p><strong>Admin:</strong> admin@shopai.kz / admin123</p>
          <p className="text-blue-500">Продавец: зарегистрируйтесь выбрав "Продавец"</p>
        </div>
      </div>
    </div>
  )
}
