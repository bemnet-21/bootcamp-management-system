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
    const status = error.response?.status;
    const requestUrl = String(error.config?.url || '');
    const isAuthRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/password-reset-request') ||
      requestUrl.includes('/auth/password-reset-confirm');

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem('vanguard_token');
      localStorage.removeItem('vanguard-auth-storage');
      const isAdminArea = window.location.pathname.startsWith('/admin');
      const loginPath = isAdminArea ? '/admin/login' : '/login';
      if (window.location.pathname !== loginPath) {
        window.location.replace(loginPath);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
