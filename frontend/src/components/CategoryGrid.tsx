import { Link } from 'react-router-dom'
import { useT } from '../utils/i18n'

const CATEGORIES = [
  {
    name: 'Electronics',
    label_kz: 'Электроника',
    label_ru: 'Электроника',
    img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&q=80',
    from: 'from-blue-500',
    to: 'to-indigo-600',
    shadow: 'hover:shadow-blue-200 dark:hover:shadow-blue-900',
  },
  {
    name: 'Clothing',
    label_kz: 'Киім',
    label_ru: 'Одежда',
    img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&q=80',
    from: 'from-pink-500',
    to: 'to-rose-600',
    shadow: 'hover:shadow-pink-200 dark:hover:shadow-pink-900',
  },
  {
    name: 'Books',
    label_kz: 'Кітаптар',
    label_ru: 'Книги',
    img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&q=80',
    from: 'from-amber-400',
    to: 'to-orange-500',
    shadow: 'hover:shadow-amber-200 dark:hover:shadow-amber-900',
  },
  {
    name: 'Home',
    label_kz: 'Үй',
    label_ru: 'Дом',
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80',
    from: 'from-emerald-400',
    to: 'to-teal-600',
    shadow: 'hover:shadow-emerald-200 dark:hover:shadow-emerald-900',
  },
  {
    name: 'Sports',
    label_kz: 'Спорт',
    label_ru: 'Спорт',
    img: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=200&q=80',
    from: 'from-purple-500',
    to: 'to-violet-600',
    shadow: 'hover:shadow-purple-200 dark:hover:shadow-purple-900',
  },
]

export default function CategoryGrid() {
  const t = useT()

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('categories')}</h2>
          <p className="text-sm text-gray-400 mt-0.5">{t('footer_categories')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.name}
            to={`/category/${cat.name}`}
            className={`group relative rounded-2xl overflow-hidden aspect-square shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${cat.shadow}`}
          >
            {/* Background photo */}
            <img
              src={cat.img}
              alt={cat.label_ru}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />

            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${cat.from} ${cat.to} opacity-60 group-hover:opacity-70 transition-opacity`} />

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-end p-3 pb-4">
              <p className="text-white font-black text-sm text-center leading-tight drop-shadow-lg">
                {cat.label_kz}
              </p>
              <p className="text-white/75 text-xs text-center mt-0.5 drop-shadow">
                {cat.label_ru}
              </p>
            </div>

            {/* Top badge */}
            <div className={`absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br ${cat.from} ${cat.to} flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100`}>
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
