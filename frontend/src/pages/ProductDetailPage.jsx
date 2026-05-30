import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await productsAPI.getById(id);
        setProduct(data.product || data);
      } catch (err) {
        setError('Product not found or server error.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  if (!product) return (
    <div className="page"><div className="container"><div className="empty-state">
      <div style={{ fontSize: '4rem' }}>😕</div>
      <h3>{error || 'Product not found'}</h3>
      <button className="btn btn-primary mt-2" onClick={() => navigate('/')}>← Back to Home</button>
    </div></div></div>
  );

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  return (
    <div className="page">
      <div className="container">
        <button className="btn btn-outline btn-sm mb-3" onClick={() => navigate(-1)}>← Back</button>
        <div className="product-detail-layout">
          {/* Image */}
          <div className="product-detail-img">
            {product.imageUrl
              ? <img src={product.imageUrl} alt={product.name} style={{ borderRadius: 'var(--radius)', maxHeight: 420, objectFit: 'cover' }} />
              : <div className="product-detail-placeholder">
                  <span style={{ fontSize: '8rem' }}>
                    {product.category === 'Electronics' ? '📱' : product.category === 'Clothing' ? '👕' : product.category === 'Books' ? '📚' : '📦'}
                  </span>
                </div>
            }
          </div>

          {/* Info */}
          <div className="product-detail-info">
            <span className="product-category">{product.category}</span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.5rem 0' }}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
              <span style={{ color: '#f7b731', fontSize: '1.2rem' }}>{'★'.repeat(Math.round(product.rating || 4))}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{product.rating || 4} ({product.numReviews || 0} reviews)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <span className="price" style={{ fontSize: '2rem' }}>₹{product.price?.toLocaleString('en-IN')}</span>
              {product.originalPrice && <span className="price-old" style={{ fontSize: '1.1rem' }}>₹{product.originalPrice?.toLocaleString('en-IN')}</span>}
              {discount && <span className="badge badge-success">{discount}% OFF</span>}
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>{product.description}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
              </span>
            </div>

            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Quantity:</span>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span className="qty-value">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary btn-lg"
                disabled={product.stock === 0}
                onClick={() => { if (!isAuthenticated) { navigate('/login'); return; } addItem(product, qty); }}
                id="add-to-cart-detail"
              >
                🛒 Add to Cart
              </button>
              <button
                className="btn btn-success btn-lg"
                disabled={product.stock === 0}
                onClick={() => { if (!isAuthenticated) { navigate('/login'); return; } addItem(product, qty); navigate('/cart'); }}
                id="buy-now"
              >
                ⚡ Buy Now
              </button>
            </div>

            <div className="trust-badges" style={{ marginTop: '1.5rem' }}>
              <span>🔒 Secure Payment</span>
              <span>📦 Free Shipping ₹999+</span>
              <span>↩ 30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
