import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'

const CATEGORIES = [
  { name: 'Electronics', label: 'Электроника' },
  { name: 'Clothing',    label: 'Одежда'      },
  { name: 'Books',       label: 'Книги'       },
  { name: 'Home',        label: 'Дом'         },
  { name: 'Sports',      label: 'Спорт'       },
]

export default function Footer() {
  return (
    <footer className="bg-[#002B33] text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#004B57] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">Q</span>
            </div>
            <span className="text-white text-xl font-black">QOLDA</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Ақылды маркетплейс — Машиналық оқыту алгоритмдеріне негізделген персонализацияланған сауда платформасы.
          </p>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-2"><MapPin size={13} /> Алматы, Казахстан</div>
            <div className="flex items-center gap-2"><Mail size={13} /> support@qolda.kz</div>
            <div className="flex items-center gap-2"><Phone size={13} /> +7 (727) 000-00-00</div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-semibold mb-4">Санаттар / Категории</h4>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.map(c => (
              <li key={c.name}>
                <Link to={`/category/${c.name}`} className="hover:text-[#F5A623] transition-colors">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="text-white font-semibold mb-4">Аккаунт</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/profile" className="hover:text-[#F5A623] transition-colors">Профиль</Link></li>
            <li><Link to="/orders"  className="hover:text-[#F5A623] transition-colors">Мои заказы</Link></li>
            <li><Link to="/cart"    className="hover:text-[#F5A623] transition-colors">Корзина</Link></li>
            <li><Link to="/login"   className="hover:text-[#F5A623] transition-colors">Войти</Link></li>
            <li><Link to="/register" className="hover:text-[#F5A623] transition-colors">Регистрация</Link></li>
          </ul>
        </div>

        {/* Sellers */}
        <div>
          <h4 className="text-white font-semibold mb-4">Продавцам</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/register" className="hover:text-[#F5A623] transition-colors">Начать продавать</Link></li>
            <li><Link to="/seller/dashboard" className="hover:text-[#F5A623] transition-colors">Кабинет продавца</Link></li>
          </ul>
          <div className="mt-6 p-4 bg-[#004B57]/40 rounded-xl border border-[#004B57]/30">
            <p className="text-xs text-white/60 mb-2">Дипломный проект</p>
            <p className="text-xs text-white/40 leading-relaxed">
              Гибридная ML-система рекомендаций: Collaborative Filtering (SVD) + Content-Based (TF-IDF)
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>© 2026 QOLDA — Дипломдық жоба / Дипломный проект</span>
          <span>Все права защищены</span>
        </div>
      </div>
    </footer>
  )
}
