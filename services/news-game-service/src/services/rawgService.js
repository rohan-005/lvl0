const axios = require("axios");
const { baseURL, apiKey } = require("../config/rawg");

const rawgClient = axios.create({
  baseURL,
  timeout: 5000, // 5 second timeout for external RAWG API
  params: {
    key: apiKey,
  },
});

module.exports = rawgClient;
