import { useCart } from '../context/CartContext';

export default function CartItem({ item }) {
  const { removeItem, updateQty } = useCart();

  return (
    <div className="cart-item">
      <div className="cart-item-img">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.name} />
          : <div className="cart-img-placeholder">📦</div>
        }
      </div>

      <div className="cart-item-info">
        <h4 className="cart-item-name">{item.name}</h4>
        <span className="product-category">{item.category}</span>
        <div className="cart-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          ₹{item.price?.toLocaleString('en-IN')} each
        </div>
      </div>

      <div className="cart-item-actions">
        <div className="qty-controls">
          <button className="qty-btn" onClick={() => updateQty(item._id, item.quantity - 1)}>−</button>
          <span className="qty-value">{item.quantity}</span>
          <button className="qty-btn" onClick={() => updateQty(item._id, item.quantity + 1)}>+</button>
        </div>
        <button className="btn btn-danger btn-sm" onClick={() => removeItem(item._id)}>🗑 Remove</button>
      </div>
    </div>
  );
}
