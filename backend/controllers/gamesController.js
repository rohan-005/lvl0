const rawgClient = require("../service/rawgService");

// GET /api/games
exports.getGames = async (req, res) => {
  try {
    const response = await rawgClient.get("/games", {
      params: req.query,
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch games" });
  }
};

// GET /api/games/:id
exports.getGameDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await rawgClient.get(`/games/${id}`);
    res.json(response.data);
  } catch (err) {
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
    res.status(500).json({ message: "Failed to fetch screenshots" });
  }
};

// GET /api/games/:id/stores
exports.getStores = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await rawgClient.get(`/games/${id}/stores`);
    res.json(response.data);
  } catch {
    res.status(500).json({ message: "Failed to fetch stores" });
  }
};
