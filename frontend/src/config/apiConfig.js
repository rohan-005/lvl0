const sanitizeUrl = (url) => (url ? url.replace(/\/$/, "") : "");

const defaultBase = sanitizeUrl(import.meta.env.VITE_BACKEND_URL) || "http://localhost:5000";

export const API_CONFIG = {
  USER_SERVICE_URL: sanitizeUrl(import.meta.env.VITE_USER_SERVICE_URL) || defaultBase,
  EMAIL_SERVICE_URL: sanitizeUrl(import.meta.env.VITE_EMAIL_SERVICE_URL) || defaultBase,
  NEWS_GAME_SERVICE_URL: sanitizeUrl(import.meta.env.VITE_NEWS_GAME_SERVICE_URL) || defaultBase,
  CHAT_SERVICE_URL: sanitizeUrl(import.meta.env.VITE_CHAT_SERVICE_URL) || defaultBase,
  BASE_URL: defaultBase,
};

export default API_CONFIG;
