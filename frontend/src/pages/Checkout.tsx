import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Clock, CheckCircle2 } from 'lucide-react'
import { toast } from '../store/toastStore'
import { useCartStore } from '../store/cartStore'
import { useUserStore } from '../store/userStore'
import { ordersApi } from '../api/orders'
import { deliveryApi } from '../api/delivery'
import type { DeliveryService } from '../api/types'
import ProductImage from '../components/ProductImage'

function formatPrice(n: number) {
  return n.toLocaleString('ru-KZ') + ' ₸'
}

function deliveryDays(min: number, max: number) {
  if (min === 0 && max === 0) return 'Сегодня'
  if (min === max) return `${min} дн.`
  return `${min}–${max} дн.`
}

export default function Checkout() {
  const { items, total, clear } = useCartStore()
  const user = useUserStore(s => s.user)
  const navigate = useNavigate()

  const [customerName, setCustomerName] = useState(user?.name || '')
  const [phone, setPhone]               = useState('')
  const [phoneError, setPhoneError]     = useState('')
  const [address, setAddress]           = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [success, setSuccess]           = useState(false)
  const [orderId, setOrderId]           = useState<number | null>(null)

  const [deliveryServices, setDeliveryServices] = useState<DeliveryService[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryService | null>(null)

  useEffect(() => {
    deliveryApi.getAll().then(list => {
      setDeliveryServices(list)
      if (list.length > 0) setSelectedDelivery(list[0])
    })
  }, [])

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (!value) return 'Введите номер телефона'
    if (!/^(\+7|8)/.test(value)) return 'Номер должен начинаться с +7 или 8'
    if (digits.length !== 11) return 'Номер должен содержать 11 цифр'
    return ''
  }

  const handlePhoneChange = (value: string) => {
    setPhone(value)
    if (phoneError) setPhoneError(validatePhone(value))
  }

  const deliveryCost = selectedDelivery?.price ?? 0
  const orderTotal   = total() + deliveryCost

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validatePhone(phone)
    if (err) { setPhoneError(err); return }
    if (!user || items.length === 0) return
    setSubmitting(true)
    try {
      const order = await ordersApi.create(
        items.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
        address,
        customerName,
        phone,
        selectedDelivery?.id,
      )
      clear()
      setOrderId(order.id)
      setSuccess(true)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg || 'Қате болды / Произошла ошибка')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Тапсырыс қабылданды!</h2>
        <p className="text-gray-500 mb-2">Заказ принят успешно!</p>
        <p className="text-gray-400 text-sm mb-1">Тапсырыс №{orderId}</p>
        {selectedDelivery && (
          <p className="text-sm text-gray-500 mb-6">
            Доставка: {selectedDelivery.name} · {deliveryDays(selectedDelivery.days_min, selectedDelivery.days_max)}
          </p>
        )}
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => navigate('/orders')} className="btn-primary">
            Тапсырыстарым / Мои заказы
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Басты бет / Главная
          </button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Себет бос / Корзина пуста</p>
        <button onClick={() => navigate('/')} className="btn-primary">Дүкенге оралу / В магазин</button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Тапсырыс беру / Оформление заказа</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <form onSubmit={handleSubmit} className="flex-1 space-y-4">

          {/* Recipient */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold">Алушы деректері / Данные получателя</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Аты-жөні / ФИО <span className="text-red-500">*</span>
              </label>
              <input
                required
                className="input"
                placeholder="Айдар Бекұлы"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="tel"
                className={`input ${phoneError ? 'border-red-400 focus:ring-red-200' : ''}`}
                placeholder="+77771234567 или 87771234567"
                value={phone}
                onChange={e => handlePhoneChange(e.target.value)}
                onBlur={() => setPhoneError(validatePhone(phone))}
              />
              {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="card p-6">
            <h3 className="font-semibold mb-3">
              Жеткізу мекенжайы / Адрес доставки <span className="text-red-500">*</span>
            </h3>
            <textarea
              required
              className="input"
              rows={3}
              placeholder="Алматы, ул. Абая 150, кв. 25..."
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          {/* Delivery */}
          {deliveryServices.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Truck size={16} className="text-[#004B57]" />
                Жеткізу тәсілі / Способ доставки
              </h3>
              <div className="space-y-2">
                {deliveryServices.map(svc => {
                  const selected = selectedDelivery?.id === svc.id
                  return (
                    <label
                      key={svc.id}
                      className={`flex items-center gap-4 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        selected
                          ? 'border-[#004B57] bg-[#004B57]/5'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        className="sr-only"
                        checked={selected}
                        onChange={() => setSelectedDelivery(svc)}
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selected ? 'border-[#004B57]' : 'border-gray-300'
                      }`}>
                        {selected && <div className="w-2 h-2 rounded-full bg-[#004B57]" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{svc.name}</p>
                        <p className="text-xs text-gray-400">{svc.name_kz}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">
                          {svc.price === 0 ? 'Бесплатно' : formatPrice(svc.price)}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                          <Clock size={10} />
                          {deliveryDays(svc.days_min, svc.days_max)}
                        </p>
                      </div>
                      {selected && <CheckCircle2 size={16} className="text-[#004B57] flex-shrink-0" />}
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !address || !customerName || !phone || !!phoneError}
            className="btn-primary w-full py-3 text-base"
          >
            {submitting ? 'Жіберілуде...' : 'Растау / Подтвердить заказ'}
          </button>
        </form>

        {/* Order summary */}
        <div className="w-full md:w-72">
          <div className="card p-6 sticky top-4">
            <h3 className="font-bold mb-4">Тапсырыс / Заказ</h3>
            <div className="space-y-3 mb-4">
              {items.map(({ product, quantity }) => {
                const price = product.discount_price ?? product.price
                return (
                  <div key={product.id} className="flex gap-3 text-sm">
                    <ProductImage
                      src={product.image_url}
                      alt={product.name_ru}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      iconSize={20}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">{product.name_ru}</p>
                      <p className="text-gray-500">{quantity} × {formatPrice(price)}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Товары</span>
                <span>{formatPrice(total())}</span>
              </div>
              {selectedDelivery && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Доставка ({selectedDelivery.name})</span>
                  <span>{selectedDelivery.price === 0 ? 'Бесплатно' : formatPrice(selectedDelivery.price)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Барлығы / Итого</span>
                <span className="text-[#004B57]">{formatPrice(orderTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
