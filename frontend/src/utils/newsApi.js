import axios from "axios";
import { API_CONFIG } from "../config/apiConfig";

const API = axios.create({
  baseURL: API_CONFIG.NEWS_GAME_SERVICE_URL,
});

export const getNews = async (query, limit = 15) => {
  try {
    const res = await API.get(`/api/news`, {
      params: { q: query, limit },
    });
    return res.data.articles || [];
  } catch {
    return [];
  }
};
