import { useState } from 'react'
import { useUserStore } from '../../store/userStore'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Bell, LogOut, Save, Check, Eye, EyeOff } from 'lucide-react'
import { authApi } from '../../api/auth'
import { toast } from '../../store/toastStore'

export default function SellerSettings() {
  const { user, setAuth, logout } = useUserStore()
  const navigate = useNavigate()

  const [name, setName]       = useState(user?.name ?? '')
  const [email, setEmail]     = useState(user?.email ?? '')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  const [currentPwd, setCurrentPwd]   = useState('')
  const [newPwd, setNewPwd]           = useState('')
  const [confirmPwd, setConfirmPwd]   = useState('')
  const [showPwd, setShowPwd]         = useState(false)
  const [pwdSaving, setPwdSaving]     = useState(false)

  const [notif, setNotif] = useState({
    newOrder:   true,
    lowStock:   true,
    newReview:  false,
    promotions: false,
  })

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const updated = await authApi.updateMe({ name: name.trim(), email: email.trim() })
      const token = localStorage.getItem('token') ?? ''
      setAuth(updated, token)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      toast.success('Профиль сохранён')
    } catch {
      toast.error('Ошибка сохранения профиля')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPwd || !newPwd) return
    if (newPwd !== confirmPwd) {
      toast.error('Пароли не совпадают')
      return
    }
    if (newPwd.length < 6) {
      toast.error('Новый пароль должен быть не менее 6 символов')
      return
    }
    setPwdSaving(true)
    try {
      await authApi.changePassword(currentPwd, newPwd)
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
      toast.success('Пароль изменён')
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(detail || 'Неверный текущий пароль')
    } finally {
      setPwdSaving(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  if (!user) return null

  const initials = user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
        <p className="text-sm text-gray-400 mt-0.5">Управление профилем и предпочтениями</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <User size={15} className="text-[#004B57]" />
          <h2 className="text-sm font-semibold text-gray-900">Профиль</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="p-5 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#004B57] text-white text-lg font-bold flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-400">{user.is_admin ? 'Администратор' : 'Продавец'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Аты / Имя</label>
              <input
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ваше имя"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-[#004B57] hover:bg-[#003840] text-white'
              } disabled:opacity-60`}
            >
              {saved ? <><Check size={14} /> Сохранено</> : <><Save size={14} /> {saving ? 'Сохранение...' : 'Сохранить'}</>}
            </button>
          </div>
        </form>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <Bell size={15} className="text-[#004B57]" />
          <h2 className="text-sm font-semibold text-gray-900">Уведомления</h2>
        </div>
        <div className="p-5 space-y-3">
          {[
            { key: 'newOrder',   label: 'Новый заказ',          sub: 'Получать уведомления при оформлении нового заказа' },
            { key: 'lowStock',   label: 'Мало товара на складе', sub: 'Предупреждение когда остаток ≤ 5 единиц' },
            { key: 'newReview',  label: 'Новый отзыв',           sub: 'Когда покупатель оставляет отзыв о товаре' },
            { key: 'promotions', label: 'Промоакции QOLDA',      sub: 'Новости и специальные предложения платформы' },
          ].map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between gap-4 py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
              <button
                type="button"
                onClick={() => setNotif(n => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
                  notif[key as keyof typeof notif] ? 'bg-[#004B57]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                    notif[key as keyof typeof notif] ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <Lock size={15} className="text-[#004B57]" />
          <h2 className="text-sm font-semibold text-gray-900">Безопасность</h2>
        </div>
        <form onSubmit={handleChangePassword} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Текущий пароль</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className="input pr-10"
                value={currentPwd}
                onChange={e => setCurrentPwd(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Новый пароль</label>
              <input
                type={showPwd ? 'text' : 'password'}
                className="input"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Подтверждение</label>
              <input
                type={showPwd ? 'text' : 'password'}
                className={`input ${confirmPwd && newPwd !== confirmPwd ? 'border-red-300 focus:ring-red-300' : ''}`}
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwdSaving || !currentPwd || !newPwd || !confirmPwd}
              className="px-4 py-2.5 bg-[#004B57] hover:bg-[#003840] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {pwdSaving ? 'Сохранение...' : 'Изменить пароль'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-red-700">Выйти из аккаунта</p>
          <p className="text-xs text-red-400 mt-0.5">Завершить текущую сессию</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <LogOut size={14} /> Выйти
        </button>
      </div>
    </div>
  )
}
