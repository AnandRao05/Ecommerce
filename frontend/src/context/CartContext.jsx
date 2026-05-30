import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { addToast } = useToast();

  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) {
        addToast(`Updated "${product.name}" quantity`, 'info');
        return prev.map(i => i._id === product._id
          ? { ...i, quantity: i.quantity + qty }
          : i
        );
      }
      addToast(`"${product.name}" added to cart 🛒`, 'success');
      return [...prev, { ...product, quantity: qty }];
    });
  }, [addToast]);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i._id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems(prev => prev.map(i => i._id === id ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('cart');
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal   = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping   = subtotal > 0 ? (subtotal >= 999 ? 0 : 49) : 0;
  const total      = subtotal + shipping;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, subtotal, shipping, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
