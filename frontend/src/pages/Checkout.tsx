import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Clock, CheckCircle2, Smartphone, Banknote, CreditCard, ShieldCheck, RefreshCw } from 'lucide-react'
import { toast } from '../store/toastStore'
import { useCartStore } from '../store/cartStore'
import { useUserStore } from '../store/userStore'
import { ordersApi } from '../api/orders'
import { deliveryApi } from '../api/delivery'
import type { DeliveryService } from '../api/types'
import ProductImage from '../components/ProductImage'

function formatPrice(n: number) { return n.toLocaleString('ru-KZ') + ' ₸' }
function deliveryDays(min: number, max: number) {
  if (min === 0 && max === 0) return 'Сегодня'
  if (min === max) return `${min} дн.`
  return `${min}–${max} дн.`
}

type PayMethod = 'kaspi_qr' | 'cash' | 'card'

const PAY_METHODS: { key: PayMethod; label: string; sub: string; icon: React.ElementType; color: string; badge?: string }[] = [
  { key: 'kaspi_qr', label: 'Kaspi QR',         sub: 'Сканируй и оплати в Kaspi',     icon: Smartphone,  color: 'text-[#F14635]', badge: 'Быстро' },
  { key: 'cash',     label: 'Наличными',          sub: 'Оплата курьеру при получении',  icon: Banknote,    color: 'text-green-600' },
  { key: 'card',     label: 'Картой при получении', sub: 'POS-терминал у курьера',       icon: CreditCard,  color: 'text-blue-600' },
]

// QR-код через открытый сервис
function kaspiQrUrl(amount: number, orderId: number, phone: string) {
  const payload = JSON.stringify({
    merchant: 'QOLDA',
    phone,
    amount,
    order: orderId,
    currency: 'KZT',
  })
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(payload)}`
}

// ── Kaspi QR экран ──────────────────────────────────────────────────
function KaspiQrScreen({
  amount, orderId, phone, onPaid, onCancel,
}: {
  amount: number; orderId: number; phone: string
  onPaid: () => void; onCancel: () => void
}) {
  const TIMEOUT = 10 * 60 // 10 минут
  const [sec, setSec] = useState(TIMEOUT)
  const [refreshed, setRefreshed] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timer.current = setInterval(() => setSec(s => s - 1), 1000)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [refreshed])

  useEffect(() => {
    if (sec <= 0) { if (timer.current) clearInterval(timer.current) }
  }, [sec])

  const mm = String(Math.floor(Math.max(sec, 0) / 60)).padStart(2, '0')
  const ss = String(Math.max(sec, 0) % 60).padStart(2, '0')
  const expired = sec <= 0

  const refresh = () => { setSec(TIMEOUT); setRefreshed(r => r + 1) }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="bg-[#F14635] px-6 py-5 text-white text-center relative">
          <div className="flex items-center justify-center gap-2 mb-1">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Kaspi_Bank_logo.svg/200px-Kaspi_Bank_logo.svg.png"
              alt="Kaspi" className="h-6 object-contain brightness-0 invert" />
          </div>
          <p className="text-white/80 text-sm">Сканируй QR в приложении Kaspi.kz</p>
        </div>

        <div className="px-6 py-5 flex flex-col items-center gap-4">
          {/* Amount */}
          <div className="text-center">
            <p className="text-3xl font-black text-gray-900 dark:text-white">{formatPrice(amount)}</p>
            <p className="text-xs text-gray-400 mt-0.5">Заказ #{orderId}</p>
          </div>

          {/* QR */}
          <div className={`relative rounded-2xl overflow-hidden border-4 ${expired ? 'border-red-300 opacity-50' : 'border-[#F14635]/20'}`}>
            <img
              key={refreshed}
              src={kaspiQrUrl(amount, orderId, phone)}
              alt="Kaspi QR"
              className="w-[220px] h-[220px]"
            />
            {expired && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 gap-2">
                <p className="text-sm font-bold text-red-500">QR истёк</p>
                <button onClick={refresh} className="flex items-center gap-1.5 text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg">
                  <RefreshCw size={12} /> Обновить
                </button>
              </div>
            )}
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 text-sm font-mono font-bold ${expired ? 'text-red-500' : sec < 120 ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}>
            <Clock size={14} />
            {expired ? 'Время вышло' : `${mm}:${ss}`}
          </div>

          {/* Steps */}
          <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2 text-xs text-gray-600 dark:text-gray-400">
            {[
              '1. Откройте приложение Kaspi.kz',
              '2. Нажмите «Сканировать QR»',
              '3. Направьте камеру на код',
              '4. Подтвердите платёж',
            ].map(s => <p key={s}>{s}</p>)}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Отменить
            </button>
            <button
              onClick={onPaid}
              className="flex-1 py-2.5 rounded-xl bg-[#F14635] hover:bg-[#d93d2b] text-white text-sm font-bold transition-colors"
            >
              Я оплатил ✓
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            Нажимая «Я оплатил», вы подтверждаете совершение платежа.<br />
            Заказ будет передан в обработку автоматически.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Success screen ───────────────────────────────────────────────────
function SuccessScreen({
  orderId, payMethod, delivery, onOrders, onHome
}: {
  orderId: number; payMethod: PayMethod
  delivery: DeliveryService | null
  onOrders: () => void; onHome: () => void
}) {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <ShieldCheck size={40} className="text-green-500" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
        {payMethod === 'kaspi_qr' ? 'Оплата прошла!' : 'Заказ принят!'}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-1">
        {payMethod === 'kaspi_qr'
          ? 'Платёж через Kaspi QR подтверждён'
          : payMethod === 'cash' ? 'Оплата наличными курьеру' : 'Оплата картой при получении'}
      </p>
      <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2 my-4">
        <span className="text-gray-500 text-sm">Заказ</span>
        <span className="font-black text-[#004B57] dark:text-teal-400 text-lg">#{orderId}</span>
      </div>
      {delivery && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          🚚 {delivery.name} · {deliveryDays(delivery.days_min, delivery.days_max)}
        </p>
      )}
      <div className="flex gap-3 justify-center flex-wrap">
        <button onClick={onOrders} className="btn-primary">Мои заказы</button>
        <button onClick={onHome}   className="btn-secondary">На главную</button>
      </div>
    </div>
  )
}

// ── Main Checkout ────────────────────────────────────────────────────
export default function Checkout() {
  const { items, total, clear } = useCartStore()
  const user = useUserStore(s => s.user)
  const navigate = useNavigate()

  const [customerName, setCustomerName] = useState(user?.name || '')
  const [phone, setPhone]               = useState('')
  const [phoneError, setPhoneError]     = useState('')
  const [address, setAddress]           = useState('')
  const [payMethod, setPayMethod]       = useState<PayMethod>('kaspi_qr')
  const [submitting, setSubmitting]     = useState(false)

  const [orderId, setOrderId]       = useState<number | null>(null)
  const [showQr, setShowQr]         = useState(false)
  const [success, setSuccess]       = useState(false)

  const [deliveryServices, setDeliveryServices] = useState<DeliveryService[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryService | null>(null)

  useEffect(() => {
    deliveryApi.getAll().then(list => {
      setDeliveryServices(list)
      if (list.length > 0) setSelectedDelivery(list[0])
    })
  }, [])

  const validatePhone = (v: string) => {
    const d = v.replace(/\D/g, '')
    if (!v) return 'Введите номер телефона'
    if (!/^(\+7|8)/.test(v)) return 'Номер должен начинаться с +7 или 8'
    if (d.length !== 11) return 'Номер должен содержать 11 цифр'
    return ''
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
        address, customerName, phone, selectedDelivery?.id,
      )
      clear()
      setOrderId(order.id)
      if (payMethod === 'kaspi_qr') {
        setShowQr(true)
      } else {
        setSuccess(true)
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg || 'Произошла ошибка')
    } finally {
      setSubmitting(false)
    }
  }

  if (success && orderId) {
    return (
      <SuccessScreen
        orderId={orderId} payMethod={payMethod}
        delivery={selectedDelivery}
        onOrders={() => navigate('/orders')}
        onHome={() => navigate('/')}
      />
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Корзина пуста</p>
        <button onClick={() => navigate('/')} className="btn-primary">В магазин</button>
      </div>
    )
  }

  return (
    <>
      {/* Kaspi QR modal */}
      {showQr && orderId && (
        <KaspiQrScreen
          amount={orderTotal}
          orderId={orderId}
          phone={phone}
          onPaid={() => { setShowQr(false); setSuccess(true) }}
          onCancel={() => { setShowQr(false); navigate('/orders') }}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Оформление заказа</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <form onSubmit={handleSubmit} className="flex-1 space-y-4">

            {/* Recipient */}
            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-gray-800 dark:text-white">Данные получателя</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ФИО <span className="text-red-500">*</span>
                </label>
                <input required className="input" placeholder="Айдар Бекұлы"
                  value={customerName} onChange={e => setCustomerName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Телефон <span className="text-red-500">*</span>
                </label>
                <input required type="tel"
                  className={`input ${phoneError ? 'border-red-400 focus:ring-red-200' : ''}`}
                  placeholder="+77771234567"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); if (phoneError) setPhoneError(validatePhone(e.target.value)) }}
                  onBlur={() => setPhoneError(validatePhone(phone))}
                />
                {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
              </div>
            </div>

            {/* Address */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-800 dark:text-white mb-3">
                Адрес доставки <span className="text-red-500">*</span>
              </h3>
              <textarea required className="input" rows={3}
                placeholder="Алматы, ул. Абая 150, кв. 25..."
                value={address} onChange={e => setAddress(e.target.value)} />
            </div>

            {/* Delivery */}
            {deliveryServices.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Truck size={16} className="text-[#004B57]" /> Способ доставки
                </h3>
                <div className="space-y-2">
                  {deliveryServices.map(svc => {
                    const sel = selectedDelivery?.id === svc.id
                    return (
                      <label key={svc.id}
                        className={`flex items-center gap-4 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${sel ? 'border-[#004B57] bg-[#004B57]/5' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}>
                        <input type="radio" name="delivery" className="sr-only"
                          checked={sel} onChange={() => setSelectedDelivery(svc)} />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${sel ? 'border-[#004B57]' : 'border-gray-300'}`}>
                          {sel && <div className="w-2 h-2 rounded-full bg-[#004B57]" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{svc.name}</p>
                          <p className="text-xs text-gray-400">{svc.name_kz}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {svc.price === 0 ? 'Бесплатно' : formatPrice(svc.price)}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                            <Clock size={10} /> {deliveryDays(svc.days_min, svc.days_max)}
                          </p>
                        </div>
                        {sel && <CheckCircle2 size={16} className="text-[#004B57] flex-shrink-0" />}
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Payment method */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                💳 Способ оплаты
              </h3>
              <div className="space-y-2">
                {PAY_METHODS.map(m => {
                  const sel = payMethod === m.key
                  const Icon = m.icon
                  return (
                    <label key={m.key}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        sel
                          ? m.key === 'kaspi_qr'
                            ? 'border-[#F14635] bg-[#F14635]/5'
                            : 'border-[#004B57] bg-[#004B57]/5'
                          : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                      }`}>
                      <input type="radio" name="payment" className="sr-only"
                        checked={sel} onChange={() => setPayMethod(m.key)} />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        sel
                          ? m.key === 'kaspi_qr' ? 'border-[#F14635]' : 'border-[#004B57]'
                          : 'border-gray-300'
                      }`}>
                        {sel && <div className={`w-2 h-2 rounded-full ${m.key === 'kaspi_qr' ? 'bg-[#F14635]' : 'bg-[#004B57]'}`} />}
                      </div>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        m.key === 'kaspi_qr' ? 'bg-[#F14635]/10' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <Icon size={18} className={m.color} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{m.label}</p>
                          {m.badge && (
                            <span className="text-[10px] font-bold bg-[#F14635] text-white px-1.5 py-0.5 rounded-full">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{m.sub}</p>
                      </div>
                      {sel && <CheckCircle2 size={16} className={m.key === 'kaspi_qr' ? 'text-[#F14635]' : 'text-[#004B57]'} />}
                    </label>
                  )
                })}
              </div>

              {/* Kaspi tip */}
              {payMethod === 'kaspi_qr' && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-[#F14635]/5 border border-[#F14635]/20 rounded-xl">
                  <span className="text-lg">📱</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    После оформления откроется QR-код. Откройте <strong>Kaspi.kz</strong> → <strong>Сканировать</strong> → наведите камеру и подтвердите платёж.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !address || !customerName || !phone || !!phoneError}
              className={`w-full py-3.5 rounded-xl text-white text-base font-bold transition-all disabled:opacity-50 ${
                payMethod === 'kaspi_qr'
                  ? 'bg-[#F14635] hover:bg-[#d93d2b]'
                  : 'bg-[#004B57] hover:bg-[#003840]'
              }`}
            >
              {submitting
                ? 'Оформляем...'
                : payMethod === 'kaspi_qr'
                  ? '📱 Оформить и оплатить через Kaspi'
                  : 'Подтвердить заказ →'}
            </button>
          </form>

          {/* Order summary */}
          <div className="w-full md:w-72">
            <div className="card p-6 sticky top-4">
              <h3 className="font-bold mb-4 text-gray-800 dark:text-white">Ваш заказ</h3>
              <div className="space-y-3 mb-4">
                {items.map(({ product, quantity }) => {
                  const price = product.discount_price ?? product.price
                  return (
                    <div key={product.id} className="flex gap-3 text-sm">
                      <ProductImage src={product.image_url} alt={product.name_ru}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0" iconSize={20} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1 text-gray-800 dark:text-white">{product.name_ru}</p>
                        <p className="text-gray-500">{quantity} × {formatPrice(price)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t dark:border-gray-800 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Товары</span><span>{formatPrice(total())}</span>
                </div>
                {selectedDelivery && (
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Доставка</span>
                    <span>{selectedDelivery.price === 0 ? 'Бесплатно' : formatPrice(selectedDelivery.price)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-base border-t dark:border-gray-800 pt-2">
                  <span className="text-gray-900 dark:text-white">Итого</span>
                  <span className="text-[#004B57] dark:text-teal-400">{formatPrice(orderTotal)}</span>
                </div>
              </div>

              {/* Payment badge */}
              <div className={`mt-4 flex items-center gap-2 p-3 rounded-xl text-xs font-semibold ${
                payMethod === 'kaspi_qr'
                  ? 'bg-[#F14635]/10 text-[#F14635]'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                {payMethod === 'kaspi_qr' ? <Smartphone size={13} /> : payMethod === 'cash' ? <Banknote size={13} /> : <CreditCard size={13} />}
                {PAY_METHODS.find(m => m.key === payMethod)?.label}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
