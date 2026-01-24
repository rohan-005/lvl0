const express = require("express");
const axios = require("axios");

const router = express.Router();

// Gaming + Dev focused keywords
const BASE_QUERY =
  '(gaming OR "video games" OR "game development" OR gamedev OR unity OR unreal OR indie games OR esports OR programming OR developer community OR open source)';

router.get("/", async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "NEWS_API_KEY missing",
      });
    }

    const { q, limit = 15 } = req.query;

    const response = await axios.get(
      "https://newsapi.org/v2/everything",
      {
        params: {
          q: q || BASE_QUERY,
          pageSize: limit,
          sortBy: "publishedAt",
          language: "en",
          apiKey,
        },
      }
    );

    res.status(200).json({
      success: true,
      articles: response.data.articles,
    });
  } catch (error) {
    console.error(
      "NEWS API ERROR:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch news",
    });
  }
});

module.exports = router;
