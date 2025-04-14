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
        let errorMessage = 'An unknown error occurred';
        
        if (error.response) {
          // Server responded with an error status code
          const status = error.response.status;
          const data = error.response.data;
          
          switch (status) {
            case 401:
              errorMessage = 'Authentication required. Please log in.';
              break;
            case 403:
              errorMessage = 'You do not have permission to access this resource.';
              break;
            case 404:
              errorMessage = 'The requested resource was not found.';
              break;
            case 419:
              errorMessage = 'Your session has expired. Please refresh the page.';
              break;
            case 422:
              errorMessage = data.message || 'Validation error. Please check your input.';
              console.error('Validation errors:', data.errors);
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = data.message || `Error ${status}: Request failed`;
          }
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = 'No response from server. Please check your internet connection.';
        } else {
          // Error in setting up the request
          errorMessage = error.message || 'Error setting up the request';
        }
        
        // Add the error message to the error object
        error.userMessage = errorMessage;
        
        console.error('API Error:', errorMessage, error);
        return Promise.reject(error);
      }
    );
  }

  async get(url, options = {}) {
    try {
      const response = await this.instance.get(url, options);
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  }

  async post(url, data, options = {}) {
    try {
      const response = await this.instance.post(url, data, options);
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  }

  async put(url, data, options = {}) {
    try {
      const response = await this.instance.put(url, data, options);
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  }

  async delete(url, options = {}) {
    try {
      const response = await this.instance.delete(url, options);
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  }

  async request(url, options = {}) {
    try {
      const response = await this.instance.request({
        url,
        ...options
      });
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  }
}

const createHttpClient = (baseURL) => {
  return new HttpClient(baseURL);
};

export default createHttpClient;
