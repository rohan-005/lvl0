import axios from "./axiosConfig";

export const fetchGames = (params = {}) =>
  axios.get("/games", { params });

export const fetchGameDetails = (id) =>
  axios.get(`/games/${id}`);

export const fetchGameScreenshots = (id) =>
  axios.get(`/games/${id}/screenshots`);

export const fetchGameStores = (id) =>
  axios.get(`/games/${id}/stores`);
