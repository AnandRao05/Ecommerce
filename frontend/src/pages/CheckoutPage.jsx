import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersAPI } from '../services/api';

const STEPS = ['Shipping', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shipping_info, setShippingInfo] = useState({
    fullName: user?.name || '', email: user?.email || '',
    phone: '', address: '', city: '', state: '', pincode: '', country: 'India',
  });
  const [payment, setPayment] = useState({ method: 'cod' });

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    const req = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
    const missing = req.find(k => !shipping_info[k].trim());
    if (missing) { addToast('Please fill all required fields', 'warning'); return; }
    setStep(1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const payload = {
        items: items.map(i => ({ product: i._id, name: i.name, price: i.price, quantity: i.quantity })),
        shippingAddress: shipping_info,
        paymentMethod: payment.method,
        subtotal, shipping, total,
      };
      await ordersAPI.create(payload);
      clearCart();
      addToast('Order placed successfully! 🎉', 'success');
      navigate('/orders');
    } catch (err) {
      addToast(err.response?.data?.message || 'Order failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="page-header">
          <h1>Checkout</h1>
        </div>

        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={s} className={`step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="step-dot">{i < step ? '✓' : i + 1}</div>
              <span className="step-label">{s}</span>
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">
            {/* STEP 0: Shipping */}
            {step === 0 && (
              <div className="card">
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>📍 Shipping Address</h2>
                <form onSubmit={handleShippingSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input className="form-control" value={shipping_info.fullName} onChange={e => setShippingInfo(p => ({ ...p, fullName: e.target.value }))} placeholder="John Doe" />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input className="form-control" type="email" value={shipping_info.email} onChange={e => setShippingInfo(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
                    </div>
                    <div className="form-group">
                      <label>Phone *</label>
                      <input className="form-control" type="tel" value={shipping_info.phone} onChange={e => setShippingInfo(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input className="form-control" value={shipping_info.country} onChange={e => setShippingInfo(p => ({ ...p, country: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                      <label>Address *</label>
                      <input className="form-control" value={shipping_info.address} onChange={e => setShippingInfo(p => ({ ...p, address: e.target.value }))} placeholder="Street, Area" />
                    </div>
                    <div className="form-group">
                      <label>City *</label>
                      <input className="form-control" value={shipping_info.city} onChange={e => setShippingInfo(p => ({ ...p, city: e.target.value }))} placeholder="Mumbai" />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input className="form-control" value={shipping_info.state} onChange={e => setShippingInfo(p => ({ ...p, state: e.target.value }))} placeholder="Maharashtra" />
                    </div>
                    <div className="form-group">
                      <label>PIN Code *</label>
                      <input className="form-control" value={shipping_info.pincode} onChange={e => setShippingInfo(p => ({ ...p, pincode: e.target.value }))} placeholder="400001" maxLength={6} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" id="next-to-payment">Continue to Payment →</button>
                </form>
              </div>
            )}

            {/* STEP 1: Payment */}
            {step === 1 && (
              <div className="card">
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>💳 Payment Method</h2>
                <div className="payment-options">
                  {[
                    { value: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive your order' },
                    { value: 'upi', label: 'UPI',              icon: '📱', desc: 'PhonePe, GPay, Paytm, etc.' },
                    { value: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
                    { value: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major Indian banks' },
                  ].map(opt => (
                    <label key={opt.value} className={`payment-opt ${payment.method === opt.value ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value={opt.value} checked={payment.method === opt.value} onChange={() => setPayment({ method: opt.value })} />
                      <span className="pay-icon">{opt.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700 }}>{opt.label}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-outline" onClick={() => setStep(0)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(2)} id="next-to-review">Review Order →</button>
                </div>
              </div>
            )}

            {/* STEP 2: Review */}
            {step === 2 && (
              <div className="card">
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>📋 Review Order</h2>
                <div className="review-section">
                  <h4>Delivery Address</h4>
                  <div className="review-box">
                    <strong>{shipping_info.fullName}</strong>
                    <div>{shipping_info.address}, {shipping_info.city}, {shipping_info.state} — {shipping_info.pincode}</div>
                    <div>{shipping_info.phone} | {shipping_info.email}</div>
                  </div>
                  <h4 style={{ marginTop: '1rem' }}>Items ({items.length})</h4>
                  {items.map(item => (
                    <div key={item._id} className="review-item">
                      <span>{item.name} × {item.quantity}</span>
                      <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                    </div>
                  ))}
                  <h4 style={{ marginTop: '1rem' }}>Payment: <span style={{ color: 'var(--primary-light)' }}>{payment.method.toUpperCase()}</span></h4>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button
                    className="btn btn-success btn-lg"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    id="place-order"
                  >
                    {loading ? '⏳ Placing…' : '✅ Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mini Cart Summary */}
          <div className="cart-summary" style={{ height: 'fit-content' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h3>
            {items.map(i => (
              <div key={i._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{i.name} ×{i.quantity}</span>
                <span>₹{(i.price * i.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="cart-summary-row total">
              <span>Total</span>
              <strong>₹{total.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
