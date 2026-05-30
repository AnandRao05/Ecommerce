import { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';

const STATUS_COLOR = {
  pending:    'badge-warning',
  processing: 'badge-info',
  shipped:    'badge-primary',
  delivered:  'badge-success',
  cancelled:  'badge-danger',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await ordersAPI.getMyOrders();
        setOrders(data.orders || data);
      } catch (err) {
        setError('Failed to load orders. Please try again later.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner" /><p>Loading orders…</p></div>;

  if (error) return (
    <div className="page">
      <div className="container">
        <div className="empty-state" style={{ paddingTop: '5rem' }}>
          <div style={{ fontSize: '5rem' }}>⚠️</div>
          <h3>Could not load orders</h3>
          <p>{error}</p>
          <button className="btn btn-primary mt-3" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    </div>
  );

  if (orders.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: '5rem' }}>
            <div style={{ fontSize: '5rem' }}>📦</div>
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here!</p>
            <a href="/" className="btn btn-primary mt-3">🛍 Shop Now</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>My Orders</h1>
          <p>{orders.length} total orders</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => (
            <div key={order._id} className="card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
              <div className="order-header">
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>#{order._id}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`badge ${STATUS_COLOR[order.status] || 'badge-info'}`}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </span>
                  <strong style={{ fontSize: '1.1rem' }}>₹{order.total?.toLocaleString('en-IN')}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{expanded === order._id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded Details */}
              {expanded === order._id && (
                <div className="order-details" onClick={e => e.stopPropagation()}>
                  <div className="order-divider" />
                  <h4 style={{ marginBottom: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Items</h4>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="review-item">
                      <span>{item.name} × {item.quantity}</span>
                      <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                    </div>
                  ))}
                  {order.shippingAddress && (
                    <div style={{ marginTop: '1rem' }}>
                      <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Delivery Address</h4>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {order.shippingAddress.fullName && <div>{order.shippingAddress.fullName}</div>}
                        <div>{order.shippingAddress.address || order.shippingAddress.city}, {order.shippingAddress.city}, {order.shippingAddress.state}</div>
                      </div>
                    </div>
                  )}
                  {/* Status Timeline */}
                  <div className="status-timeline">
                    {['pending', 'processing', 'shipped', 'delivered'].map((s, i) => {
                      const statuses = ['pending', 'processing', 'shipped', 'delivered'];
                      const currentIndex = statuses.indexOf(order.status);
                      const isActive = i <= currentIndex && order.status !== 'cancelled';
                      return (
                        <div key={s} className={`timeline-step ${isActive ? 'active' : ''}`}>
                          <div className="timeline-dot">{isActive ? '✓' : i + 1}</div>
                          <div className="timeline-label">{s.charAt(0).toUpperCase() + s.slice(1)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
