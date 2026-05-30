import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    addItem(product);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product._id}`)} style={{ cursor: 'pointer' }}>
      <div className="product-img-wrap">
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} className="product-img" />
          : (
            <div className="product-img-placeholder">
              {product.category === 'Electronics' ? '📱' :
               product.category === 'Clothing'    ? '👕' :
               product.category === 'Books'       ? '📚' :
               product.category === 'Food'        ? '🍔' : '📦'}
            </div>
          )
        }
        {discount && <span className="discount-badge">-{discount}%</span>}
        {product.stock === 0 && <div className="out-of-stock-overlay">Out of Stock</div>}
      </div>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description?.slice(0, 70)}...</p>

        <div className="product-footer">
          <div>
            <span className="price">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <span className="price-old" style={{ marginLeft: 8 }}>
                ₹{product.originalPrice?.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <button
            className="btn btn-primary btn-sm add-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : '+ Cart'}
          </button>
        </div>

        <div className="product-rating">
          {'★'.repeat(Math.round(product.rating || 4))}{'☆'.repeat(5 - Math.round(product.rating || 4))}
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 4 }}>
            ({product.numReviews || 0})
          </span>
        </div>
      </div>
    </div>
  );
}
