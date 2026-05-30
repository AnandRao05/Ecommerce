import { useState, useEffect } from 'react';
import { productsAPI, ordersAPI, usersAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const EMPTY_PRODUCT = { name: '', category: 'Electronics', price: '', originalPrice: '', stock: '', description: '', imageUrl: '' };
const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports', 'Food', 'Beauty'];
const STATUS_OPTS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [tab, setTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // 'product'
  const [formData, setFormData] = useState(EMPTY_PRODUCT);
  const [editId, setEditId]     = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [userDeleteConfirm, setUserDeleteConfirm] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, oRes, uRes] = await Promise.allSettled([
          productsAPI.getAll(), 
          ordersAPI.getAll(),
          usersAPI.getAll()
        ]);
        
        if (pRes.status === 'fulfilled') {
          const list = pRes.value.data.products || pRes.value.data;
          setProducts(Array.isArray(list) ? list : []);
        } else {
          addToast('Could not load products from server', 'error');
        }

        if (oRes.status === 'fulfilled') {
          const list = oRes.value.data.orders || oRes.value.data;
          setOrders(Array.isArray(list) ? list : []);
        } else {
          addToast('Could not load orders from server', 'error');
        }

        if (uRes.status === 'fulfilled') {
          setUsers(Array.isArray(uRes.value.data) ? uRes.value.data : []);
        } else {
          addToast('Could not load users from server', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── PRODUCT CRUD ── */
  const openAdd  = () => { setFormData(EMPTY_PRODUCT); setEditId(null); setModal('product'); };
  const openEdit = (p)  => { setFormData({ ...p, price: p.price?.toString(), stock: p.stock?.toString(), originalPrice: p.originalPrice?.toString() || '' }); setEditId(p._id); setModal('product'); };

  const handleProductSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) { addToast('Fill all required fields', 'warning'); return; }
    const payload = { ...formData, price: Number(formData.price), stock: Number(formData.stock), originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined };
    try {
      if (editId) {
        await productsAPI.update(editId, payload);
        setProducts(prev => prev.map(p => p._id === editId ? { ...p, ...payload } : p));
        addToast('Product updated!', 'success');
      } else {
        const { data } = await productsAPI.create(payload);
        setProducts(prev => [...prev, data.product || { ...payload, _id: Date.now().toString() }]);
        addToast('Product created!', 'success');
      }
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to save product. Please try again.', 'error');
    }
    setModal(null);
  };

  const handleDelete = async (id) => {
    try {
      await productsAPI.delete(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      addToast('Product deleted', 'success');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to delete product.', 'error');
    }
    setDeleteConfirm(null);
  };

  const handleUserDelete = async (id) => {
    try {
      await usersAPI.delete(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      addToast('User deleted successfully', 'success');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to delete user.', 'error');
    }
    setUserDeleteConfirm(null);
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      addToast('Order status updated!', 'success');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to update order status.', 'error');
    }
  };

  /* ── STATS ── */
  const totalRevenue  = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total||0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>⚡ Admin Dashboard</h1>
          <p>Manage products, orders, and monitor store performance</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {['overview', 'products', 'orders', 'customers'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'overview' ? '📊 Overview' : t === 'products' ? '📦 Products' : t === 'orders' ? '🛒 Orders' : '👥 Customers'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="spinner" /><p>Loading dashboard…</p></div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === 'overview' && (
              <>
                <div className="stat-grid">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(108,99,255,0.15)' }}>📦</div>
                    <div className="stat-value">{products.length}</div>
                    <div className="stat-label">Total Products</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(67,233,123,0.15)' }}>✅</div>
                    <div className="stat-value">{orders.length}</div>
                    <div className="stat-label">Total Orders</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(2,136,209,0.15)' }}>👥</div>
                    <div className="stat-value">{users.length}</div>
                    <div className="stat-label">Total Customers</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(255,101,132,0.15)' }}>💰</div>
                    <div className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
                    <div className="stat-label">Total Revenue</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Recent Orders</h3>
                    {orders.length === 0
                      ? <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No orders yet.</p>
                      : orders.slice(0,4).map(o => (
                        <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>#{o._id}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{o.user?.name || 'Unknown'}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700 }}>₹{o.total?.toLocaleString('en-IN')}</div>
                            <span className={`badge badge-${o.status === 'delivered' ? 'success' : o.status === 'pending' ? 'warning' : o.status === 'shipped' ? 'primary' : o.status === 'cancelled' ? 'danger' : 'info'}`}>{o.status}</span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                  <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Low Stock Alert</h3>
                    {products.filter(p => p.stock < 15).length === 0
                      ? <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>All products are well-stocked ✓</p>
                      : products.filter(p => p.stock < 15).map(p => (
                        <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '0.9rem' }}>{p.name}</span>
                          <span className={`badge ${p.stock < 5 ? 'badge-danger' : 'badge-warning'}`}>{p.stock} left</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </>
            )}

            {/* PRODUCTS */}
            {tab === 'products' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button className="btn btn-primary" onClick={openAdd} id="add-product-btn">+ Add Product</button>
                </div>
                {products.length === 0 ? (
                  <div className="empty-state">
                    <div style={{ fontSize: '4rem' }}>📦</div>
                    <h3>No products yet</h3>
                    <p>Click "Add Product" to add your first product.</p>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p, idx) => (
                          <tr key={p._id}>
                            <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                            <td><strong>{p.name}</strong></td>
                            <td><span className="badge badge-primary">{p.category}</span></td>
                            <td><strong>₹{p.price?.toLocaleString('en-IN')}</strong></td>
                            <td>
                              <span className={`badge ${p.stock < 5 ? 'badge-danger' : p.stock < 15 ? 'badge-warning' : 'badge-success'}`}>
                                {p.stock}
                              </span>
                            </td>
                            <td>{'★'.repeat(Math.round(p.rating||4))} {p.rating||4}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(p._id)}>🗑</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* ORDERS */}
            {tab === 'orders' && (
              orders.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: '4rem' }}>🛒</div>
                  <h3>No orders yet</h3>
                  <p>Customer orders will appear here once placed.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Update</th></tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o._id}>
                          <td><strong>#{o._id}</strong></td>
                          <td>{o.user?.name || 'Unknown'}</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                          <td style={{ fontSize: '0.82rem' }}>{o.items?.map(i => i.name).join(', ').slice(0, 30)}…</td>
                          <td><strong>₹{o.total?.toLocaleString('en-IN')}</strong></td>
                          <td>
                            <span className={`badge badge-${o.status === 'delivered' ? 'success' : o.status === 'pending' ? 'warning' : o.status === 'shipped' ? 'primary' : o.status === 'cancelled' ? 'danger' : 'info'}`}>
                              {o.status}
                            </span>
                          </td>
                          <td>
                            <select
                              className="form-control"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.82rem', minWidth: 130 }}
                              value={o.status}
                              onChange={e => handleOrderStatus(o._id, e.target.value)}
                            >
                              {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* CUSTOMERS */}
            {tab === 'customers' && (
              users.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: '4rem' }}>👥</div>
                  <h3>No customers yet</h3>
                  <p>User accounts will appear here once registered.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Registered</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {users.map((u, idx) => (
                        <tr key={u._id}>
                          <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                          <td><strong>{u.name}</strong></td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {new Date(u.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td>
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => setUserDeleteConfirm(u)}
                              disabled={u.role === 'admin'}
                              style={{ opacity: u.role === 'admin' ? 0.5 : 1 }}
                            >
                              🗑 Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* Product Modal */}
      {modal === 'product' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Edit Product' : 'Add Product'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <form onSubmit={handleProductSave}>
              <div className="form-group">
                <label>Product Name *</label>
                <input className="form-control" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="Product name" id="prod-name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Category *</label>
                  <select className="form-control" value={formData.category} onChange={e => setFormData(p => ({...p, category: e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input className="form-control" type="number" min="0" value={formData.stock} onChange={e => setFormData(p => ({...p, stock: e.target.value}))} placeholder="0" id="prod-stock" />
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input className="form-control" type="number" min="0" value={formData.price} onChange={e => setFormData(p => ({...p, price: e.target.value}))} placeholder="0" id="prod-price" />
                </div>
                <div className="form-group">
                  <label>Original Price (₹)</label>
                  <input className="form-control" type="number" min="0" value={formData.originalPrice} onChange={e => setFormData(p => ({...p, originalPrice: e.target.value}))} placeholder="Optional MRP" />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input className="form-control" value={formData.imageUrl} onChange={e => setFormData(p => ({...p, imageUrl: e.target.value}))} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={3} value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} placeholder="Product description…" id="prod-desc" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="save-product">
                  {editId ? '💾 Save Changes' : '✨ Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Delete Product?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)} id="confirm-delete">Delete</button>
            </div>
          </div>
        </div>
      )}
      {/* User Delete Confirm */}
      {userDeleteConfirm && (
        <div className="modal-backdrop" onClick={() => setUserDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤🗑️</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Delete Customer?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong>{userDeleteConfirm.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setUserDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleUserDelete(userDeleteConfirm._id)}>Delete User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
