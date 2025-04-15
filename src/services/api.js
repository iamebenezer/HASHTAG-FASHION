import createHttpClient from './httpClient';

// Use the correct API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'https://admin.hashtagfashionbrand.com';

// Create HTTP client instance
const api = createHttpClient(API_URL);

// Transform product response to include image URL and format color variants
const transformProductResponse = (response) => {
  if (response.data) {
    if (Array.isArray(response.data)) {
      response.data = response.data.map(product => ({
        ...product,
        image_url: product.image ? `${API_URL}/storage/${product.image}` : null,
        colorVariants: product.colorVariants ? product.colorVariants.map(variant => ({
          ...variant,
          image_url: variant.image ? `${API_URL}/storage/${variant.image}` : null,
          price: parseFloat(variant.price || product.price),
          stock: parseInt(variant.stock || product.stock)
        })) : []
      }));
    } else {
      response.data.image_url = response.data.image ? `${API_URL}/storage/${response.data.image}` : null;
      if (response.data.colorVariants) {
        response.data.colorVariants = response.data.colorVariants.map(variant => ({
          ...variant,
          image_url: variant.image ? `${API_URL}/storage/${variant.image}` : null,
          price: parseFloat(variant.price || response.data.price),
          stock: parseInt(variant.stock || response.data.stock)
        }));
      }
    }
  }
  return response;
};

// Helper function to extract data from response
const extractData = response => response.data;

export const apiService = {
  // Category endpoints
  categories: {
    getAll: () => api.get('/categories').then(extractData),
    getById: (id) => api.get(`/categories/${id}`).then(extractData),
  },
  
  // Product endpoints
  products: {
    getAll: () => api.get('/products').then(transformProductResponse).then(extractData),
    getById: (id) => api.get(`/products/${id}`).then(transformProductResponse).then(extractData),
    getByCategory: (categoryId) => api.get(`/categories/${categoryId}/products`).then(transformProductResponse).then(extractData),
    search: (query, categoryId) => {
      let url = '/products/search';
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (categoryId) params.append('category', categoryId);
      if (params.toString()) url += `?${params.toString()}`;
      return api.get(url).then(transformProductResponse).then(extractData);
    }
  },

  // Cart endpoints
  cart: {
    getCart: () => api.get('/cart').then(extractData),
    addToCart: (productId, quantity = 1) => api.post('/cart/add', { product_id: productId, quantity }).then(extractData),
    updateCartItem: (productId, quantity) => api.post('/cart/update', { product_id: productId, quantity }).then(extractData),
    removeFromCart: (productId) => api.post('/cart/remove', { product_id: productId }).then(extractData),
    clearCart: () => api.post('/cart/clear').then(extractData),
  },

  // Shipping Fee endpoints
  shippingFees: {
    getAll: () => api.get('/shipping-fees').then(extractData)
  },

  // Order endpoints
  orders: {
    create: (orderData) => api.post('/orders', orderData).then(extractData),
    getById: (id) => api.get(`/orders/${id}`).then(extractData),
    updateStatus: (orderId, data) => api.put(`/orders/${orderId}/status`, data).then(extractData),
  }
};

export default apiService;