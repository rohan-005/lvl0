import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
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
