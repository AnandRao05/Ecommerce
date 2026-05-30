import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-redirect on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/* ===== AUTH ===== */
export const authAPI = {
  login:         (data) => api.post('/auth/login', data),
  signup:        (data) => api.post('/auth/register', data),
  logout:        ()     => api.post('/auth/logout'),
  me:            ()     => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

/* ===== PRODUCTS ===== */
export const productsAPI = {
  getAll:   (params) => api.get('/products', { params }),
  getById:  (id)     => api.get(`/products/${id}`),
  create:   (data)   => api.post('/products', data),
  update:   (id, d)  => api.put(`/products/${id}`, d),
  delete:   (id)     => api.delete(`/products/${id}`),
  getCategories: ()  => api.get('/products/categories'),
};

/* ===== ORDERS ===== */
export const ordersAPI = {
  create:    (data)  => api.post('/orders', data),
  getMyOrders: ()    => api.get('/orders/me'),
  getAll:    ()      => api.get('/orders'),
  getById:   (id)    => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

/* ===== USERS (Admin) ===== */
export const usersAPI = {
  getAll:  ()      => api.get('/users'),
  update:  (id, d) => api.put(`/users/${id}`, d),
  delete:  (id)    => api.delete(`/users/${id}`),
};

export default api;
