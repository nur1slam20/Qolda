import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white text-xl font-bold mb-3">Shop<span className="text-amber-400">AI</span></h3>
          <p className="text-sm text-gray-400">
            Машиналық оқыту алгоритмдеріне негізделген ақылды онлайн дүкен.
            <br />
            Умный интернет-магазин на основе алгоритмов машинного обучения.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Санаттар / Категории</h4>
          <ul className="space-y-1 text-sm">
            {['Electronics', 'Clothing', 'Books', 'Home', 'Sports'].map(c => (
              <li key={c}>
                <Link to={`/category/${c}`} className="hover:text-amber-400 transition-colors">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Аккаунт</h4>
          <ul className="space-y-1 text-sm">
            <li><Link to="/profile" className="hover:text-amber-400 transition-colors">Профиль / Профиль</Link></li>
            <li><Link to="/orders" className="hover:text-amber-400 transition-colors">Тапсырыстар / Заказы</Link></li>
            <li><Link to="/cart" className="hover:text-amber-400 transition-colors">Себет / Корзина</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-500">
        © 2024 ShopAI — Дипломдық жоба / Дипломный проект
      </div>
    </footer>
  )
}
