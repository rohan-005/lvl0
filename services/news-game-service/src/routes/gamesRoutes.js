const express = require("express");
const router = express.Router();
const controller = require("../controllers/gamesController");
const rawgClient = require("../services/rawgService");

router.get("/", controller.getGames);
router.get("/:id", controller.getGameDetails);
router.get("/:id/screenshots", controller.getScreenshots);
router.get("/:id/stores", controller.getStores);

router.get("/:id/similar", async (req, res) => {
  try {
    const { id } = req.params;

    const gameRes = await rawgClient.get(`/games/${id}`);
    const genres = gameRes.data.genres?.map(g => g.slug);

    if (!genres || genres.length === 0) {
      return res.json({ results: [] });
    }

    const similarRes = await rawgClient.get("/games", {
      params: {
        genres: genres.join(","),
        page_size: 12,
        exclude_additions: true,
      },
    });

    const filtered = similarRes.data.results.filter(
      g => g.id.toString() !== id
    );

    res.json({ results: filtered });
  } catch (err) {
    console.error("[news-game-service] Similar games error:", err.message);
    res.json({ results: [] });
  }
});

module.exports = router;
