import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

/**
 * News API client — routed through the gateway to the news-game-service.
 */
const API = axios.create({
  baseURL: API_CONFIG.GATEWAY_URL,
});

export const getNews = async (query, limit = 15) => {
  try {
    const res = await API.get('/api/news', {
      params: { q: query, limit },
    });
    return res.data.articles || [];
  } catch {
    return [];
  }
};
