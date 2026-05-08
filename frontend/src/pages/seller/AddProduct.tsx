import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsApi } from '../../api/products'

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports']

export default function AddProduct() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name_ru: '',
    name_kz: '',
    description_ru: '',
    description_kz: '',
    category: CATEGORIES[0],
    subcategory: '',
    price: '',
    discount_price: '',
    image_url: '',
    stock: '100',
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
        name_ru: form.name_ru.trim(),
        name_kz: form.name_kz.trim(),
        description_ru: form.description_ru.trim() || undefined,
        description_kz: form.description_kz.trim() || undefined,
        category: form.category,
        subcategory: form.subcategory.trim() || undefined,
        price,
        discount_price: form.discount_price ? parseFloat(form.discount_price) : undefined,
        image_url: form.image_url.trim() || undefined,
        stock: parseInt(form.stock) || 100,
      })
      navigate('/seller/products')
    } catch (e: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg || 'Қате болды / Произошла ошибка')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Добавить товар</h1>
        <p className="text-gray-400 text-sm mt-0.5">Заполните информацию о новом товаре</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Атауы (орысша) / Название (рус) <span className="text-red-500">*</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Атауы (қазақша) / Название (каз) <span className="text-red-500">*</span>
            </label>
            <input
              required
              className="input"
              value={form.name_kz}
              onChange={e => set('name_kz', e.target.value)}
              placeholder="Lenovo IdeaPad ноутбугі"
            />
          </div>
        </div>

        {/* Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Санат / Категория <span className="text-red-500">*</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ішкі санат / Подкатегория
            </label>
            <input
              className="input"
              value={form.subcategory}
              onChange={e => set('subcategory', e.target.value)}
              placeholder="Laptops"
            />
          </div>
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Баға (₸) / Цена <span className="text-red-500">*</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Жеңілдік бағасы / Скидочная цена
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Қор / Остаток <span className="text-red-500">*</span>
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

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Сурет URL / Ссылка на фото
          </label>
          <input
            type="url"
            className="input"
            value={form.image_url}
            onChange={e => set('image_url', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Descriptions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Сипаттама (орысша) / Описание (рус)
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Сипаттама (қазақша) / Описание (каз)
          </label>
          <textarea
            className="input"
            rows={3}
            value={form.description_kz}
            onChange={e => set('description_kz', e.target.value)}
            placeholder="Тауардың толық сипаттамасы..."
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5">
            {submitting ? 'Сақталуда...' : 'Тауарды жариялау / Опубликовать товар'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/seller/products')}
            className="btn-secondary px-6"
          >
            Болдырмау / Отмена
          </button>
        </div>
      </form>
    </div>
  )
}
