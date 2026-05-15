import { useState } from 'react'
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart,
  Users, Bot, Settings, Bell, LogOut, Warehouse, MessageSquare, Menu, X,
} from 'lucide-react'
import { useUserStore } from '../../store/userStore'

const NAV = [
  { to: '/seller/dashboard', icon: LayoutDashboard, label: 'Дашборд'      },
  { to: '/seller/products',  icon: Package,          label: 'Товары'       },
  { to: '/seller/warehouse', icon: Warehouse,        label: 'Склад'        },
  { to: '/seller/orders',    icon: ShoppingCart,     label: 'Заказы'       },
  { to: '/seller/customers', icon: Users,            label: 'Клиенты'      },
  { to: '/seller/ai',        icon: Bot,              label: 'AI Ассистент' },
  { to: '/seller/chat',      icon: MessageSquare,    label: 'Чат'          },
  { to: '/seller/settings',  icon: Settings,         label: 'Настройки'    },
]

export default function SellerLayout() {
  const { user, logout } = useUserStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return <Navigate to="/login" replace />
  if (!user.is_seller && !user.is_admin) return <Navigate to="/" replace />

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#004B57] rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">МБ</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Мой Бизнес</p>
            <p className="text-xs text-gray-400">Управление ростом</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#004B57] text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#004B57] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Выйти"
            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-100 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-64 bg-white flex flex-col shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 h-14 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-medium text-gray-400">QOLDA</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors relative">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#004B57] flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide leading-tight">
                  {user.is_admin ? 'Администратор' : 'Продавец'}
                </p>
              </div>
            </div>
            {/* Mobile close (if sidebar open handled by overlay, but also X in header) */}
            <button
              className="md:hidden text-gray-400 hover:text-red-500 transition-colors"
              onClick={handleLogout}
              title="Выйти"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
