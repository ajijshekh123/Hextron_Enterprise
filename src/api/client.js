/**
 * Centralized API Client for Hextron Enterprises
 * Handles baseURL, JWT headers, error interception, and session expiration
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('hextron_auth_token') || null;
    this.onUnauthorized = null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('hextron_auth_token', token);
    } else {
      localStorage.removeItem('hextron_auth_token');
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('hextron_auth_token');
    }
    return this.token;
  }

  setOnUnauthorized(callback) {
    this.onUnauthorized = callback;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null);
          if (this.onUnauthorized) {
            this.onUnauthorized();
          }
        }

        const errorMessage = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.details = data?.error?.details || null;
        throw error;
      }

      return data;
    } catch (err) {
      if (!err.status) {
        err.message = 'Unable to connect to server. Please ensure the backend is running.';
      }
      throw err;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
