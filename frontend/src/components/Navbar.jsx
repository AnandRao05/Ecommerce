import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🛍️</span>
          <span className="gradient-text">ShopX</span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Products</Link>
          {user && <Link to="/orders" className="nav-link">My Orders</Link>}
          {isAdmin && <Link to="/admin" className="nav-link admin-link">⚡ Admin</Link>}
        </div>

        {/* Right actions */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {/* Cart */}
          <Link to="/cart" className="nav-icon-btn" aria-label="Cart">
            🛒
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>
            )}
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="dropdown" style={{ position: 'relative' }}>
              <button className="dropdown-trigger" onClick={() => setDropOpen(o => !o)}>
                <div className="avatar">{user.name?.[0]?.toUpperCase() || 'U'}</div>
                <span className="user-name">{user.name?.split(' ')[0]}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>▼</span>
              </button>
              {dropOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-info">
                    <div style={{ fontWeight: 700 }}>{user.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                    <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-info'}`} style={{ marginTop: 4 }}>
                      {isAdmin ? '⚡ Admin' : '👤 User'}
                    </span>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/orders"  className="dropdown-item" onClick={() => setDropOpen(false)}>📦 My Orders</Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropOpen(false)}>👤 My Profile</Link>
                  {isAdmin && <Link to="/admin" className="dropdown-item" onClick={() => setDropOpen(false)}>⚙️ Admin Panel</Link>}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <Link to="/login"  className="btn btn-outline btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/"        className="mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/products" className="mobile-link" onClick={() => setMenuOpen(false)}>Products</Link>
          <Link to="/cart"    className="mobile-link" onClick={() => setMenuOpen(false)}>Cart ({totalItems})</Link>
          {user && <Link to="/orders" className="mobile-link" onClick={() => setMenuOpen(false)}>My Orders</Link>}
          {isAdmin && <Link to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
          {user
            ? <button className="mobile-link danger-link" onClick={handleLogout}>Logout</button>
            : <>
                <Link to="/login"  className="mobile-link" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="mobile-link" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
          }
        </div>
      )}
    </nav>
  );
}
