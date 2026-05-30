import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';

export default function CartPage() {
  const { items, clearCart, subtotal, shipping, total, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: '6rem' }}>
            <div style={{ fontSize: '5rem' }}>🛒</div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet!</p>
            <Link to="/" className="btn btn-primary mt-3">🛍 Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Shopping Cart</h1>
          <p>{totalItems} item{totalItems !== 1 ? 's' : ''} in cart</p>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{totalItems} items</span>
              <button className="btn btn-outline btn-sm" onClick={clearCart}>🗑 Clear Cart</button>
            </div>
            <div className="cart-items-list">
              {items.map(item => <CartItem key={item._id} item={item} />)}
            </div>
            <Link to="/" className="btn btn-outline mt-3">← Continue Shopping</Link>
          </div>

          {/* Summary */}
          <div>
            <div className="cart-summary">
              <h3 style={{ fontWeight: 700, marginBottom: '1.2rem' }}>Order Summary</h3>
              <div className="cart-summary-row">
                <span>Subtotal ({totalItems} items)</span>
                <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
              </div>
              <div className="cart-summary-row">
                <span>Shipping</span>
                <strong style={{ color: shipping === 0 ? 'var(--success)' : undefined }}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </strong>
              </div>
              {shipping > 0 && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                  Add ₹{(999 - subtotal).toLocaleString('en-IN')} more for free shipping!
                </p>
              )}
              <div className="cart-summary-row total">
                <span>Total</span>
                <strong className="gradient-text" style={{ fontSize: '1.3rem' }}>₹{total.toLocaleString('en-IN')}</strong>
              </div>
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                onClick={() => isAuthenticated ? navigate('/checkout') : navigate('/login')}
                id="proceed-checkout"
              >
                {isAuthenticated ? '🔐 Proceed to Checkout' : '🔑 Login to Checkout'}
              </button>
              <div className="trust-badges">
                <span>🔒 Secure Payment</span>
                <span>📦 Fast Delivery</span>
                <span>↩ Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
