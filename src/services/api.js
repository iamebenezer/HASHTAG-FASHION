import axios from 'axios';

// Base URL for the Laravel API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Axios instance configured for the Laravel API
 * - Sets base URL
 * - Configures headers for JSON
 * - Enables credentials for cookies/session authentication
 * - Adds authorization token to requests
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // for cookies/session authentication with Laravel Sanctum
});

// Request interceptor for adding the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API services
 */
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getUser: () => api.get('/auth/user'),
};

/**
 * Products API services
 */
export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: () => api.get('/products/featured'),
  getProductsByCategory: (category) => api.get(`/products/categories/${category}`),
};

/**
 * Cart API services
 */
export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (item) => api.post('/cart/add', item),
  updateCartItem: (id, quantity) => api.put(`/cart/update/${id}`, { quantity }),
  removeCartItem: (id) => api.delete(`/cart/remove/${id}`),
  clearCart: () => api.delete('/cart/clear'),
};

/**
 * Order API services
 */
export const orderService = {
  getOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrderStatus: (id) => api.get(`/orders/${id}/status`),
};

/**
 * User profile API services
 */
export const userService = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (profileData) => api.put('/user/profile', profileData),
};

export default api;