import axios from 'axios';

const axiosInstance = axios.create({
  // Backend runs on :5000 in dev; allow override via VITE_API_URL.
  baseURL:
    (import.meta as any).env?.VITE_API_URL ||
    ((import.meta as any).env?.DEV ? 'http://localhost:5000' : ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject JWT token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vanguard_token');
    const looksLikeJwt =
      typeof token === 'string' &&
      token !== 'undefined' &&
      token !== 'null' &&
      token.split('.').length === 3;

    if (looksLikeJwt) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token) {
      localStorage.removeItem('vanguard_token');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle global errors (e.g., 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vanguard_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
