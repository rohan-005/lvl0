import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

/**
 * Default axios instance — all requests routed through the API Gateway.
 * The gateway handles routing to individual microservices internally.
 */
const api = axios.create({
  baseURL: API_CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/* =========================
   REQUEST INTERCEPTOR
   Attach JWT token from localStorage
   ========================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
   Handle 401 globally
   ========================= */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;
