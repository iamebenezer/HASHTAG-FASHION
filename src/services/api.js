import createHttpClient from './httpClient';

// Use the correct API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'https://admin.hashtagfashionbrand.com';

// Create HTTP client instance
const api = createHttpClient(API_URL);

// Transform product response to include image URL and format color variants
const transformProductResponse = (response) => {
  if (response.data) {
    if (Array.isArray(response.data)) {
      response.data = response.data.map(product => {
        // Always normalize colorVariants from color_variants if present, fallback to colorVariants
        let colorVariants = [];
        if (Array.isArray(product.color_variants) && product.color_variants.length > 0) {
          colorVariants = product.color_variants;
        } else if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
          colorVariants = product.colorVariants;
        }
        return {
          ...product,
          image_url: product.image ? `${API_URL}/storage/${product.image}` : null,
          colorVariants,
        };
      });
    } else {
      const product = response.data;
      let colorVariants = [];
      if (Array.isArray(product.color_variants) && product.color_variants.length > 0) {
        colorVariants = product.color_variants;
      } else if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
        colorVariants = product.colorVariants;
      }
      product.image_url = product.image ? `${API_URL}/storage/${product.image}` : null;
      product.colorVariants = colorVariants;
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
    getPreorderProducts: () => api.get('/products/preorder').then(transformProductResponse).then(extractData),
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
  },

  // Preorder endpoints
  preorders: {
    create: (preorderData) => api.post('/preorders', preorderData).then(extractData),
    getById: (id) => api.get(`/preorders/${id}`).then(extractData),
    linkOrder: (preorderId, orderData) => api.put(`/preorders/${preorderId}/link-order`, orderData).then(extractData),
  }
};

export default apiService;