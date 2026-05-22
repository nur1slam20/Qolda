import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Search, ShoppingCart, Heart, User, Package, LayoutDashboard, Shield, Moon, Sun, MapPin, MessageCircle } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useUserStore } from '../store/userStore'
import { useThemeStore } from '../store/themeStore'
import { useLangStore, type Lang } from '../store/langStore'
import { useLocationStore } from '../store/locationStore'
import { useT } from '../utils/i18n'

const LANGS: { code: Lang; label: string; flag: string; img: string }[] = [
  { code: 'ru', label: 'РУ',  flag: '🇷🇺', img: 'https://flagcdn.com/w40/ru.png' },
  { code: 'kz', label: 'ҚАЗ', flag: '🇰🇿', img: 'https://flagcdn.com/w40/kz.png' },
  { code: 'en', label: 'EN',  flag: '🇬🇧', img: 'https://flagcdn.com/w40/gb.png' },
]

const KZ_CITIES = [
  'Алматы', 'Астана', 'Шымкент', 'Қарағанды', 'Атырау',
  'Өскемен', 'Павлодар', 'Семей', 'Ақтөбе', 'Тараз',
  'Қостанай', 'Орал', 'Петропавл', 'Ақтау', 'Түркістан',
  'Қызылорда', 'Талдықорған', 'Екібастұз', 'Рудный', 'Жезқазған',
]

export default function Header() {
  const [q, setQ] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const navigate = useNavigate()
  const count     = useCartStore(s => s.count())
  const wishCount = useWishlistStore(s => s.items.length)
  const { user, logout } = useUserStore()
  const { isDark, toggle } = useThemeStore()
  const { lang, setLang }  = useLangStore()
  const { city, loading, setCity, detect } = useLocationStore()
  const [cityOpen, setCityOpen] = useState(false)
  const t = useT()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`)
      setMenuOpen(false)
    }
  }

  return (
    <header className="bg-[#004B57] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm tracking-tight">Q</span>
          </div>
          <span className="text-xl font-black tracking-tight">QOLDA</span>
        </Link>

        {/* City selector */}
        <div className="hidden md:block relative flex-shrink-0">
          <button
            onClick={() => setCityOpen(o => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 text-xs transition-colors"
          >
            <MapPin size={13} className="text-[#F5A623] flex-shrink-0" />
            {loading ? (
              <span className="animate-pulse text-white/50 w-14">...</span>
            ) : (
              <span className="max-w-[110px] truncate">{city ?? '—'}</span>
            )}
            <svg className={`w-3 h-3 transition-transform flex-shrink-0 ${cityOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {cityOpen && (
            <div className="absolute left-0 top-full mt-1 bg-[#003840] rounded-xl shadow-2xl z-50 w-48 overflow-hidden">
              {/* Auto detect */}
              <button
                onClick={() => { detect(); setCityOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#F5A623] hover:bg-white/10 transition-colors border-b border-white/10"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Определить авто
              </button>
              {/* City list */}
              <div className="max-h-56 overflow-y-auto">
                {KZ_CITIES.map(c => (
                  <button
                    key={c}
                    onClick={() => { setCity(c); setCityOpen(false) }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                      city === c
                        ? 'bg-[#F5A623] text-white font-semibold'
                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search bar — desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
          <div className="flex w-full bg-white/10 rounded-xl overflow-hidden border border-white/10 focus-within:border-white/30 transition-colors">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder={t('search_placeholder')}
              className="flex-1 px-4 py-2.5 bg-transparent text-white placeholder-white/50 text-sm focus:outline-none"
            />
            <button type="submit" className="px-4 bg-[#F5A623] hover:bg-[#e09520] text-white transition-colors flex-shrink-0">
              <Search size={17} />
            </button>
          </div>
        </form>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-1">

          {/* Lang switcher — desktop dropdown */}
          <div className="hidden sm:block relative">
            <button
              onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <img
                src={LANGS.find(l => l.code === lang)?.img}
                alt={lang}
                className="w-6 h-4 object-cover rounded-sm shadow"
              />
              <svg className={`w-3 h-3 transition-transform text-white/60 ${langOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 flex flex-col bg-[#003840] rounded-xl overflow-hidden shadow-xl z-50 min-w-[120px]">
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false) }}
                    className={`flex items-center gap-2.5 px-3 py-2.5 transition-colors ${
                      lang === l.code ? 'bg-[#F5A623]' : 'hover:bg-white/10'
                    }`}
                  >
                    <img src={l.img} alt={l.label} className="w-6 h-4 object-cover rounded-sm shadow" />
                    <span className="text-xs font-semibold text-white">{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
          >
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* Wishlist */}
          <Link
            to="/favorites"
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <Heart size={20} />
            {wishCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">
                {wishCount > 9 ? '9+' : wishCount}
              </span>
            )}
            <span className="hidden lg:inline text-sm font-medium">{t('favorites')}</span>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F5A623] text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
            <span className="hidden lg:inline text-sm font-medium">{t('cart')}</span>
          </Link>

          {/* User — desktop */}
          {user ? (
            <div className="hidden md:flex items-center gap-1">
              <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                  {user.name[0].toUpperCase()}
                </div>
                {user.name.split(' ')[0]}
              </Link>
              {user.is_seller && (
                <Link to="/seller/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold transition-colors">
                  <LayoutDashboard size={13} /> {t('cabinet')}
                </Link>
              )}
              {user.is_admin && (
                <Link to="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5A623]/20 hover:bg-[#F5A623]/30 text-[#F5A623] text-xs font-semibold transition-colors">
                  <Shield size={13} /> Admin
                </Link>
              )}
              <button
                onClick={() => { logout(); navigate('/login') }}
                className="px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white text-xs"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium">
                {t('login')}
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-xl bg-[#F5A623] hover:bg-[#e09520] text-white text-sm font-semibold transition-colors">
                {t('register')}
              </Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#004B57] px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder={t('search_placeholder')}
              className="flex-1 px-4 py-2.5 rounded-l-xl bg-white/10 text-white placeholder-white/50 text-sm focus:outline-none border border-white/10"
            />
            <button type="submit" className="bg-[#F5A623] px-4 rounded-r-xl">
              <Search size={16} />
            </button>
          </form>

          {/* Mobile lang switcher */}
          <div className="flex flex-col bg-white/10 rounded-xl overflow-hidden w-fit">
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`flex items-center gap-2.5 px-4 py-2.5 transition-colors ${
                  lang === l.code ? 'bg-[#F5A623]' : 'hover:bg-white/10'
                }`}
              >
                <img src={l.img} alt={l.label} className="w-6 h-4 object-cover rounded-sm shadow" />
                <span className="text-xs font-semibold text-white">{l.label}</span>
              </button>
            ))}
          </div>

          {user ? (
            <div className="space-y-1">
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-medium">
                <User size={16} /> {user.name}
              </Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm">
                <Package size={16} /> {t('my_orders')}
              </Link>
              <Link to="/chat" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm">
                <MessageCircle size={16} /> Чат с продавцом
              </Link>
              {user.is_seller && (
                <Link to="/seller/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-semibold text-emerald-300">
                  <LayoutDashboard size={16} /> {t('my_store')}
                </Link>
              )}
              {user.is_admin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-semibold text-[#F5A623]">
                  <Shield size={16} /> {t('admin_panel')}
                </Link>
              )}
              <button
                onClick={() => { logout(); setMenuOpen(false); navigate('/login') }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm text-white/60"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2.5 border border-white/20 rounded-xl text-sm hover:bg-white/10 transition-colors">
                {t('login')}
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2.5 bg-[#F5A623] rounded-xl text-sm font-semibold hover:bg-[#e09520] transition-colors">
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
