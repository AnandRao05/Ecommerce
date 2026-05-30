import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './components.css';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';

function NotFound() {
  return (
    <div className="page" style={{ textAlign: 'center', paddingTop: '8rem' }}>
      <div style={{ fontSize: '6rem' }}>🌌</div>
      <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>404</h1>
      <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem' }}>Oops! This page doesn't exist.</p>
      <a href="/" className="btn btn-primary btn-lg">🏠 Go Home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main>
              <Routes>
                <Route path="/"           element={<HomePage />} />
                <Route path="/products"   element={<HomePage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/login"      element={<LoginPage />} />
                <Route path="/signup"     element={<SignupPage />} />
                <Route path="/cart"       element={<CartPage />} />
                <Route path="/checkout"   element={
                  <ProtectedRoute><CheckoutPage /></ProtectedRoute>
                } />
                <Route path="/orders"     element={
                  <ProtectedRoute><OrdersPage /></ProtectedRoute>
                } />
                <Route path="/profile"    element={
                  <ProtectedRoute><ProfilePage /></ProtectedRoute>
                } />
                <Route path="/admin"      element={
                  <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
                } />
                <Route path="*"           element={<NotFound />} />
              </Routes>
            </main>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
