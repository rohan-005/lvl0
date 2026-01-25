import axios from "./axiosConfig";

export const fetchGames = (params = {}) =>
  axios.get("/games", { params });

export const fetchGameDetails = (id) =>
  axios.get(`/games/${id}`);

export const fetchGameScreenshots = (id) =>
  axios.get(`/games/${id}/screenshots`);

export const fetchGameStores = (id) =>
  axios.get(`/games/${id}/stores`);

/* 🔥 Trending = ordering by popularity */
export const fetchTrendingGames = () =>
  axios.get("/games", {
    params: {
      ordering: "-added",
      page_size: 10,
    },
  });
export const fetchSimilarGames = (id) =>
  axios.get(`/games/${id}/similar`);
