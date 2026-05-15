import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Toasts from './components/Toasts'
import ConfirmDialog from './components/ConfirmDialog'
import Home from './pages/Home'
import Category from './pages/Category'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Favorites from './pages/Favorites'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Register from './pages/Register'
import SellerLayout from './components/seller/SellerLayout'
import SellerDashboard from './pages/seller/SellerDashboard'
import AddProduct from './pages/seller/AddProduct'
import SellerProducts from './pages/seller/SellerProducts'
import SellerOrders from './pages/seller/SellerOrders'
import SellerCustomers from './pages/seller/SellerCustomers'
import SellerAI from './pages/seller/SellerAI'
import SellerWarehouse from './pages/seller/SellerWarehouse'
import SellerChat from './pages/seller/SellerChat'
import SellerSettings from './pages/seller/SellerSettings'
import { useUserStore } from './store/userStore'

function AuthLayout() {
  const user = useUserStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function GuestLayout() {
  const user = useUserStore(s => s.user)
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useUserStore(s => s.user)
  if (!user?.is_admin) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Гость */}
        <Route element={<GuestLayout />}>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Кабинет продавца */}
        <Route path="/seller" element={<SellerLayout />}>
          <Route path="dashboard"   element={<SellerDashboard />} />
          <Route path="products"    element={<SellerProducts />} />
          <Route path="orders"      element={<SellerOrders />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="customers"   element={<SellerCustomers />} />
          <Route path="ai"          element={<SellerAI />} />
          <Route path="warehouse"   element={<SellerWarehouse />} />
          <Route path="chat"        element={<SellerChat />} />
          <Route path="settings"    element={<SellerSettings />} />
          <Route index              element={<Navigate to="/seller/dashboard" replace />} />
        </Route>

        {/* Клиентский сайт */}
        <Route element={<AuthLayout />}>
          <Route path="/"               element={<Home />} />
          <Route path="/category/:name" element={<Category />} />
          <Route path="/search"         element={<Category />} />
          <Route path="/product/:id"    element={<ProductDetail />} />
          <Route path="/cart"           element={<Cart />} />
          <Route path="/checkout"       element={<Checkout />} />
          <Route path="/orders"         element={<Orders />} />
          <Route path="/profile"        element={<Profile />} />
          <Route path="/favorites"      element={<Favorites />} />
          <Route path="/admin"          element={<AdminRoute><Admin /></AdminRoute>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global overlays */}
      <Toasts />
      <ConfirmDialog />
    </BrowserRouter>
  )
}
