import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports', 'Food', 'Beauty'];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await productsAPI.getAll();
        const list = data.products || data;
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        setError('Failed to load products. Please make sure the server is running.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];
    if (category !== 'All') result = result.filter(p => p.category === category);
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === 'price-asc')  result.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sort === 'rating')     result.sort((a, b) => (b.rating||0) - (a.rating||0));
    if (sort === 'newest')     result.reverse();
    setFiltered(result);
  }, [products, search, category, sort]);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-eyebrow">🎉 Summer Sale — Up to 60% Off!</div>
          <h1>Shop the <span className="gradient-text">Future</span><br />of Retail</h1>
          <p>Discover thousands of products across every category, delivered to your doorstep with lightning speed.</p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' })}>
              🛍 Shop Now
            </button>
          </div>
          <div className="hero-stats">
            <div className="h-stat"><strong>{products.length || '—'}</strong><span>Products</span></div>
            <div className="h-stat"><strong>50K+</strong><span>Customers</span></div>
            <div className="h-stat"><strong>99%</strong><span>Satisfaction</span></div>
            <div className="h-stat"><strong>Free</strong><span>Shipping ₹999+</span></div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="page" style={{ paddingTop: '2rem', paddingBottom: '1rem' }}>
        <div className="container">
          <h2 className="section-title">Browse Categories</h2>
          <div className="categories-row">
            {CATEGORIES.slice(1).map(cat => (
              <button
                key={cat}
                className={`category-chip ${category === cat ? 'active' : ''}`}
                onClick={() => { setCategory(cat); document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' }); }}
              >
                {cat === 'Electronics' ? '📱' : cat === 'Clothing' ? '👕' : cat === 'Books' ? '📚' :
                 cat === 'Home & Kitchen' ? '🏠' : cat === 'Sports' ? '⚽' : cat === 'Food' ? '🍔' :
                 cat === 'Beauty' ? '💄' : '📦'} {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="page" style={{ paddingTop: '1rem' }} id="products-section">
        <div className="container">
          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="search-box" style={{ flex: 2 }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                id="search-products"
              />
            </div>
            <select className="form-control" style={{ maxWidth: 180 }} value={category} onChange={e => setCategory(e.target.value)} id="filter-category">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="form-control" style={{ maxWidth: 180 }} value={sort} onChange={e => setSort(e.target.value)} id="sort-products">
              <option value="">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              {category === 'All' ? 'All Products' : category}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400, marginLeft: 8 }}>
                ({filtered.length} items)
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="loading-overlay"><div className="spinner" /><p>Loading products…</p></div>
          ) : error ? (
            <div className="empty-state">
              <div style={{ fontSize: '4rem' }}>⚠️</div>
              <h3>Could not load products</h3>
              <p>{error}</p>
              <button className="btn btn-primary mt-2" onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 4 + 'rem' }}>
                {products.length === 0 ? '📦' : '🔍'}
              </div>
              <h3>{products.length === 0 ? 'No products yet' : 'No products found'}</h3>
              <p>
                {products.length === 0
                  ? 'Add products from the Admin Dashboard to get started.'
                  : 'Try a different search term or category.'}
              </p>
              {products.length > 0 && (
                <button className="btn btn-outline mt-2" onClick={() => { setSearch(''); setCategory('All'); }}>Clear Filters</button>
              )}
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
