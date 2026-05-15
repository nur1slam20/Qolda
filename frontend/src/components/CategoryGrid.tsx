import { Link } from 'react-router-dom'
import { Laptop, Shirt, BookOpen, Home, Dumbbell } from 'lucide-react'

const CATEGORIES = [
  { name: 'Electronics', label_kz: 'Электроника', label_ru: 'Электроника', Icon: Laptop,   bg: 'bg-blue-50',   icon: 'text-blue-600',   border: 'hover:border-blue-200'   },
  { name: 'Clothing',    label_kz: 'Киім',        label_ru: 'Одежда',      Icon: Shirt,    bg: 'bg-pink-50',   icon: 'text-pink-500',   border: 'hover:border-pink-200'   },
  { name: 'Books',       label_kz: 'Кітаптар',    label_ru: 'Книги',       Icon: BookOpen, bg: 'bg-amber-50',  icon: 'text-amber-600',  border: 'hover:border-amber-200'  },
  { name: 'Home',        label_kz: 'Үй',          label_ru: 'Дом',         Icon: Home,     bg: 'bg-green-50',  icon: 'text-green-600',  border: 'hover:border-green-200'  },
  { name: 'Sports',      label_kz: 'Спорт',       label_ru: 'Спорт',       Icon: Dumbbell, bg: 'bg-purple-50', icon: 'text-purple-600', border: 'hover:border-purple-200' },
]

export default function CategoryGrid() {
  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Санаттар</h2>
          <p className="text-sm text-gray-400 mt-0.5">Категории товаров</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.name}
            to={`/category/${cat.name}`}
            className={`card p-5 flex flex-col items-center gap-3 hover:shadow-md border-2 border-transparent ${cat.border} transition-all group`}
          >
            <div className={`w-12 h-12 ${cat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <cat.Icon size={24} strokeWidth={1.5} className={cat.icon} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 text-sm">{cat.label_kz}</p>
              <p className="text-xs text-gray-400">{cat.label_ru}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
