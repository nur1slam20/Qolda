import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useCartStore } from '../store/cartStore'
import { useUserStore } from '../store/userStore'

export default function Header() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const count = useCartStore(s => s.count())
  const { user, logout } = useUserStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`)
    }
  }

  return (
    <header className="bg-blue-700 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tight flex-shrink-0">
          Shop<span className="text-amber-400">AI</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="flex">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Іздеу / Поиск товаров..."
              className="w-full px-4 py-2 rounded-l-lg text-gray-900 focus:outline-none"
            />
            <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-blue-900 font-semibold px-4 py-2 rounded-r-lg transition-colors">
              🔍
            </button>
          </div>
        </form>

        {/* Nav */}
        <nav className="flex items-center gap-4 flex-shrink-0">
          <Link to="/cart" className="relative flex items-center gap-1 hover:text-amber-300 transition-colors">
            <span className="text-xl">🛒</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-400 text-blue-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
            <span className="hidden sm:inline text-sm">Себет</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="hidden sm:inline text-sm hover:text-amber-300 transition-colors">
                {user.name.split(' ')[0]}
              </Link>
              {user.is_admin && (
                <Link to="/admin" className="text-xs bg-amber-400 text-blue-900 px-2 py-1 rounded font-semibold hover:bg-amber-300">
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="text-sm text-blue-200 hover:text-white transition-colors"
              >
                Шығу
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm hover:text-amber-300 transition-colors">
                Кіру
              </Link>
              <Link to="/register" className="text-sm bg-amber-400 text-blue-900 px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-300 transition-colors">
                Тіркелу
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
