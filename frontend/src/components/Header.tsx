import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Search, ShoppingCart } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useUserStore } from '../store/userStore'

export default function Header() {
  const [q, setQ] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const count = useCartStore(s => s.count())
  const { user, logout } = useUserStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`)
      setMenuOpen(false)
    }
  }

  return (
    <header className="bg-blue-700 text-white sticky top-0 z-50 shadow-lg">
      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight flex-shrink-0">
          QOLDA
        </Link>

        {/* Search — desktop only */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
          <div className="flex w-full">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Іздеу / Поиск товаров..."
              className="w-full px-4 py-2 rounded-l-lg text-gray-900 focus:outline-none"
            />
            <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-blue-900 font-semibold px-4 py-2 rounded-r-lg transition-colors">
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {/* Cart */}
          <Link to="/cart" className="relative flex items-center gap-1 hover:text-amber-300 transition-colors">
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-400 text-blue-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
            <span className="hidden sm:inline text-sm ml-1">Себет</span>
          </Link>

          {/* Auth — desktop only */}
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/profile" className="text-sm hover:text-amber-300 transition-colors">
                {user.name.split(' ')[0]}
              </Link>
              {user.is_seller && (
                <Link to="/seller/dashboard" className="text-xs bg-green-400 text-green-900 px-2 py-1 rounded font-semibold hover:bg-green-300">
                  Дүкен
                </Link>
              )}
              {user.is_admin && (
                <Link to="/admin" className="text-xs bg-amber-400 text-blue-900 px-2 py-1 rounded font-semibold hover:bg-amber-300">
                  Admin
                </Link>
              )}
              <button onClick={() => { logout(); navigate('/login') }} className="text-sm text-blue-200 hover:text-white transition-colors">
                Шығу
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="text-sm hover:text-amber-300 transition-colors">Кіру</Link>
              <Link to="/register" className="text-sm bg-amber-400 text-blue-900 px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-300 transition-colors">
                Тіркелу
              </Link>
            </div>
          )}

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-1 hover:text-amber-300 transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-blue-600 bg-blue-700 px-4 py-4 space-y-4">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="flex">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Іздеу / Поиск..."
              className="w-full px-4 py-2 rounded-l-lg text-gray-900 focus:outline-none text-sm"
            />
            <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-blue-900 px-4 py-2 rounded-r-lg transition-colors">
              <Search size={16} />
            </button>
          </form>

          {/* Mobile nav links */}
          {user ? (
            <div className="flex flex-col gap-3 text-sm">
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="hover:text-amber-300 transition-colors"
              >
                👤 {user.name}
              </Link>
              {user.is_seller && (
                <Link
                  to="/seller/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="text-green-300 font-semibold hover:text-green-200"
                >
                  🏪 Дүкенім / Мой магазин
                </Link>
              )}
              {user.is_admin && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="text-amber-400 font-semibold hover:text-amber-300"
                >
                  ⚙️ Admin панель
                </Link>
              )}
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="hover:text-amber-300">
                📦 Тапсырыстарым
              </Link>
              <button
                onClick={() => { logout(); setMenuOpen(false); navigate('/login') }}
                className="text-left text-blue-200 hover:text-white transition-colors"
              >
                Шығу / Выйти
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2 border border-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
              >
                Кіру
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2 bg-amber-400 text-blue-900 rounded-lg text-sm font-semibold hover:bg-amber-300 transition-colors"
              >
                Тіркелу
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
