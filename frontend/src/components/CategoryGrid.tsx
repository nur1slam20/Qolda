import { Link } from 'react-router-dom'
import { Laptop, Shirt, BookOpen, Home, Dumbbell } from 'lucide-react'

const CATEGORIES = [
  { name: 'Electronics', label_kz: 'Электроника', label_ru: 'Электроника', Icon: Laptop },
  { name: 'Clothing',    label_kz: 'Киім',        label_ru: 'Одежда',      Icon: Shirt },
  { name: 'Books',       label_kz: 'Кітаптар',    label_ru: 'Книги',       Icon: BookOpen },
  { name: 'Home',        label_kz: 'Үй',          label_ru: 'Дом',         Icon: Home },
  { name: 'Sports',      label_kz: 'Спорт',       label_ru: 'Спорт',       Icon: Dumbbell },
]

export default function CategoryGrid() {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Санаттар / <span className="text-gray-500">Категории</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.name}
            to={`/category/${cat.name}`}
            className="card p-6 flex flex-col items-center gap-3 hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <cat.Icon
              size={40}
              strokeWidth={1.5}
              className="text-blue-600 group-hover:scale-110 transition-transform"
            />
            <div className="text-center">
              <p className="font-semibold text-gray-900 text-sm">{cat.label_kz}</p>
              <p className="text-xs text-gray-500">{cat.label_ru}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
