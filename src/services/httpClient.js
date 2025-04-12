import axios from 'axios';

/**
 * HTTP client using axios for better browser compatibility
 */
class HttpClient {
  constructor(baseURL = '') {
    this.instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      withCredentials: true // Include cookies in requests
    });

    // Add response interceptor
    this.instance.interceptors.response.use(
      response => response,
      error => {
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
        return Promise.reject(error);
      }
    );
  }

  async get(url, options = {}) {
    const response = await this.instance.get(url, options);
    return { data: response.data };
  }

  async post(url, data, options = {}) {
    const response = await this.instance.post(url, data, options);
    return { data: response.data };
  }

  async put(url, data, options = {}) {
    const response = await this.instance.put(url, data, options);
    return { data: response.data };
  }

  async delete(url, options = {}) {
    const response = await this.instance.delete(url, options);
    return { data: response.data };
  }

  async request(url, options = {}) {
    const response = await this.instance.request({
      url,
      ...options
    });
    return { data: response.data };
  }
}

const createHttpClient = (baseURL) => {
  return new HttpClient(baseURL);
};

export default createHttpClient;
