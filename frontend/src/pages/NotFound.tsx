import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6">
        <div className="text-8xl font-black text-[#004B57]/10 leading-none select-none">404</div>
        <div className="w-16 h-16 bg-[#004B57]/10 rounded-2xl flex items-center justify-center mx-auto -mt-4 mb-4">
          <Search size={28} className="text-[#004B57]/40" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Бет табылмады</h1>
      <p className="text-gray-400 text-sm mb-8 max-w-xs">
        Страница не найдена. Возможно, она была удалена или вы перешли по неверной ссылке.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-[#004B57] hover:bg-[#003840] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        <Home size={16} /> Басты бетке / На главную
      </Link>
    </div>
  )
}
