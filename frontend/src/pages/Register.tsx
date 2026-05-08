import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { authApi } from '../api/auth'
import { useUserStore } from '../store/userStore'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSeller, setIsSeller] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setAuth = useUserStore(s => s.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Құпиясөздер сәйкес келмейді / Пароли не совпадают')
      return
    }
    if (password.length < 6) {
      setError('Кемінде 6 символ / Минимум 6 символов')
      return
    }
    setLoading(true)
    try {
      const data = await authApi.register(name, email, password, isSeller)
      setAuth(data.user, data.access_token)
      navigate(isSeller ? '/seller/dashboard' : '/')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg || 'Тіркелу қатесі / Ошибка регистрации')
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
          <p className="text-gray-500 mt-1">Жаңа аккаунт / Новый аккаунт</p>
        </div>

        {/* Account type toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-5">
          <button
            type="button"
            onClick={() => setIsSeller(false)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              !isSeller
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Сатып алушы / Покупатель
          </button>
          <button
            type="button"
            onClick={() => setIsSeller(true)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              isSeller
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Сатушы / Продавец
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Аты / Имя
            </label>
            <input
              required
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={isSeller ? 'Дүкен атауы / Название магазина' : 'Айдар Бекұлы'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Растау / Подтвердить пароль
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                className="input pr-10"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading
              ? 'Тіркелуде...'
              : isSeller
              ? 'Сатушы ретінде тіркелу / Зарегистрироваться как продавец'
              : 'Тіркелу / Зарегистрироваться'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Аккаунтыңыз бар ма?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Кіру / Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
