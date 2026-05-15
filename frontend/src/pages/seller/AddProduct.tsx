import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Tag, ArrowLeft, Sparkles } from 'lucide-react'
import { productsApi } from '../../api/products'

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports']

export default function AddProduct() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name_ru:        '',
    name_kz:        '',
    description_ru: '',
    description_kz: '',
    category:       CATEGORIES[0],
    subcategory:    '',
    price:          '',
    discount_price: '',
    image_url:      '',
    stock:          '100',
    tags:           '',
  })

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const price = parseFloat(form.price)
    if (isNaN(price) || price <= 0) {
      setError('Бағаны дұрыс енгізіңіз / Введите корректную цену')
      return
    }
    setSubmitting(true)
    try {
      await productsApi.create({
        name_ru:        form.name_ru.trim(),
        name_kz:        form.name_kz.trim(),
        description_ru: form.description_ru.trim() || undefined,
        description_kz: form.description_kz.trim() || undefined,
        category:       form.category,
        subcategory:    form.subcategory.trim() || undefined,
        price,
        discount_price: form.discount_price ? parseFloat(form.discount_price) : undefined,
        image_url:      form.image_url.trim() || undefined,
        stock:          parseInt(form.stock) || 100,
        tags:           form.tags.trim() || undefined,
      })
      navigate('/seller/products')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg || 'Қате болды / Произошла ошибка')
    } finally {
      setSubmitting(false)
    }
  }

  const discountPct = form.price && form.discount_price
    ? Math.round((1 - parseFloat(form.discount_price) / parseFloat(form.price)) * 100)
    : null

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-7">
        <button
          onClick={() => navigate('/seller/products')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={15} /> Назад
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Добавить товар</h1>
          <p className="text-gray-400 text-sm mt-0.5">Заполните информацию о новом товаре</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section: Names */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-[#004B57]/10 rounded-lg flex items-center justify-center">
              <Package size={14} className="text-[#004B57]" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Название и категория</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Название (рус) <span className="text-red-500">*</span>
              </label>
              <input
                required
                className="input"
                value={form.name_ru}
                onChange={e => set('name_ru', e.target.value)}
                placeholder="Ноутбук Lenovo IdeaPad"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Атауы (қаз) <span className="text-red-500">*</span>
              </label>
              <input
                required
                className="input"
                value={form.name_kz}
                onChange={e => set('name_kz', e.target.value)}
                placeholder="Lenovo IdeaPad ноутбугі"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Категория <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="input"
                value={form.category}
                onChange={e => set('category', e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Подкатегория
              </label>
              <input
                className="input"
                value={form.subcategory}
                onChange={e => set('subcategory', e.target.value)}
                placeholder="Laptops"
              />
            </div>
          </div>
        </div>

        {/* Section: Price + Stock */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-[#004B57]/10 rounded-lg flex items-center justify-center">
              <span className="text-[#004B57] text-xs font-bold">₸</span>
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Цена и остаток</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Цена (₸) <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                min="1"
                step="0.01"
                className="input"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                placeholder="150000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Скидочная цена
                {discountPct !== null && discountPct > 0 && (
                  <span className="ml-1.5 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">
                    -{discountPct}%
                  </span>
                )}
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                className="input"
                value={form.discount_price}
                onChange={e => set('discount_price', e.target.value)}
                placeholder="120000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Остаток (шт.) <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                min="0"
                className="input"
                value={form.stock}
                onChange={e => set('stock', e.target.value)}
                placeholder="100"
              />
            </div>
          </div>
        </div>

        {/* Section: Media + Tags */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-[#004B57]/10 rounded-lg flex items-center justify-center">
              <Tag size={14} className="text-[#004B57]" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Медиа и теги</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ссылка на фото
              </label>
              <input
                type="url"
                className="input"
                value={form.image_url}
                onChange={e => set('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {form.image_url && (
                <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={form.image_url} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Теги / Тегтер
                <span className="ml-1.5 text-xs text-gray-400 font-normal">(через пробел, для ML-поиска)</span>
              </label>
              <input
                className="input"
                value={form.tags}
                onChange={e => set('tags', e.target.value)}
                placeholder="ноутбук компьютер lenovo офис работа"
              />
            </div>
          </div>
        </div>

        {/* Section: Descriptions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#004B57]/10 rounded-lg flex items-center justify-center">
                <Sparkles size={14} className="text-[#004B57]" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">Описание</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/seller/ai')}
              className="text-xs text-[#004B57] hover:underline font-medium flex items-center gap-1"
            >
              <Sparkles size={11} /> Сгенерировать AI →
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Описание (рус)
              </label>
              <textarea
                className="input"
                rows={3}
                value={form.description_ru}
                onChange={e => set('description_ru', e.target.value)}
                placeholder="Подробное описание товара..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Сипаттама (қаз)
              </label>
              <textarea
                className="input"
                rows={3}
                value={form.description_kz}
                onChange={e => set('description_kz', e.target.value)}
                placeholder="Тауардың толық сипаттамасы..."
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 bg-[#004B57] hover:bg-[#003840] text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {submitting ? 'Сақталуда...' : 'Тауарды жариялау / Опубликовать товар'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/seller/products')}
            className="px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Болдырмау
          </button>
        </div>
      </form>
    </div>
  )
}
