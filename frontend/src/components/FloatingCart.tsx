import { useNavigate, useLocation } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useLangStore } from '../store/langStore'

function itemLabel(count: number, lang: string) {
  if (lang === 'en') return count === 1 ? 'item' : 'items'
  if (lang === 'kz') return 'тауар'
  if (count === 1) return 'товар'
  if (count < 5) return 'товара'
  return 'товаров'
}

export default function FloatingCart() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const items     = useCartStore(s => s.items)
  const count     = useCartStore(s => s.count)()
  const total     = useCartStore(s => s.total)()
  const { lang }  = useLangStore()

  if (count === 0 || location.pathname === '/cart' || location.pathname === '/checkout') {
    return null
  }

  return (
    <button
      onClick={() => navigate('/cart')}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-2xl px-4 py-3 transition-all duration-200 hover:scale-105 active:scale-95"
    >
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      </div>
      <div className="text-left">
        <div className="text-xs opacity-80">{count} {itemLabel(count, lang)}</div>
        <div className="text-sm font-bold">{total.toLocaleString()} ₸</div>
      </div>
    </button>
  )
}
