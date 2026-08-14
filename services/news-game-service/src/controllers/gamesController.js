const rawgClient = require("../services/rawgService");

// GET /api/games
exports.getGames = async (req, res) => {
  try {
    const response = await rawgClient.get("/games", {
      params: req.query,
    });
    res.json(response.data);
  } catch (err) {
    console.error("[news-game-service] Fetch games error:", err.message);
    res.json({ results: [], count: 0, next: null, previous: null });
  }
};

// GET /api/games/:id
exports.getGameDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await rawgClient.get(`/games/${id}`);
    res.json(response.data);
  } catch (err) {
    console.error("[news-game-service] Fetch game details error:", err.message);
    res.status(500).json({ message: "Failed to fetch game details" });
  }
};

// GET /api/games/:id/screenshots
exports.getScreenshots = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await rawgClient.get(`/games/${id}/screenshots`);
    res.json(response.data);
  } catch {
    res.json({ results: [] });
  }
};

// GET /api/games/:id/stores
exports.getStores = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await rawgClient.get(`/games/${id}/stores`);
    res.json(response.data);
  } catch {
    res.json({ results: [] });
  }
};
