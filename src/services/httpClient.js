/**
 * Custom HTTP client to replace axios
 * This is a simplified version that handles the basic functionality we need
 */

class HttpClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest' // Add this for Laravel to recognize AJAX requests
    };
  }

  /**
   * Make a GET request
   * @param {string} url - The URL to request
   * @param {Object} options - Request options
   * @returns {Promise} - Promise that resolves with the response data
   */
  async get(url, options = {}) {
    return this.request(url, { 
      method: 'GET', 
      ...options 
    });
  }

  /**
   * Make a POST request
   * @param {string} url - The URL to request
   * @param {Object} data - The data to send
   * @param {Object} options - Request options
   * @returns {Promise} - Promise that resolves with the response data
   */
  async post(url, data, options = {}) {
    return this.request(url, { 
      method: 'POST', 
      body: JSON.stringify(data), 
      ...options 
    });
  }

  /**
   * Make a PUT request
   * @param {string} url - The URL to request
   * @param {Object} data - The data to send
   * @param {Object} options - Request options
   * @returns {Promise} - Promise that resolves with the response data
   */
  async put(url, data, options = {}) {
    return this.request(url, { 
      method: 'PUT', 
      body: JSON.stringify(data), 
      ...options 
    });
  }

  /**
   * Make a DELETE request
   * @param {string} url - The URL to request
   * @param {Object} options - Request options
   * @returns {Promise} - Promise that resolves with the response data
   */
  async delete(url, options = {}) {
    return this.request(url, { 
      method: 'DELETE', 
      ...options 
    });
  }

  /**
   * Make a request
   * @param {string} url - The URL to request
   * @param {Object} options - Request options
   * @returns {Promise} - Promise that resolves with the response data
   */
  async request(url, options = {}) {
    const fullUrl = this.baseURL + url;
    const headers = { ...this.defaultHeaders, ...options.headers };
    
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include', // Include cookies in the request
        mode: 'cors' // Enable CORS
      });
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
        try {
          // Try to parse as JSON anyway
          data = JSON.parse(data);
        } catch (e) {
          // If it's not JSON, keep it as text
        }
      }
      
      if (!response.ok) {
        const error = new Error(data.message || response.statusText || 'Request failed');
        error.response = {
          status: response.status,
          data
        };
        
        if (response.status === 419) {
          error.message = 'CSRF token mismatch';
        }
        
        throw error;
      }
      
      return { data };
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }
}

// Create instance with interceptors similar to axios
const createHttpClient = (baseURL) => {
  const client = new HttpClient(baseURL);
  
  // Add response interceptor for error handling
  const originalRequest = client.request.bind(client);
  client.request = async function(url, options) {
    try {
      return await originalRequest(url, options);
    } catch (error) {
      if (error.response) {
        // Handle specific error cases
        switch (error.response.status) {
          case 401:
            console.error('Unauthorized access');
            break;
          case 403:
            console.error('Forbidden access');
            break;
          case 404:
            console.error('Resource not found');
            break;
          case 419:
            console.error('CSRF token mismatch');
            break;
          case 422:
            console.error('Validation error:', error.response.data.errors);
            break;
          case 500:
            console.error('Server error');
            break;
          default:
            console.error('API error:', error.response.data);
        }
      } else {
        console.error('Network error:', error);
      }
      throw error;
    }
  };
  
  return client;
};

export default createHttpClient;
