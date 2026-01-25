const axios = require("axios");
const { baseURL, apiKey } = require("../config/rawg");

const rawgClient = axios.create({
  baseURL,
  params: {
    key: apiKey,
  },
});

module.exports = rawgClient;
