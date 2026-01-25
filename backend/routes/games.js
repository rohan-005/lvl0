const express = require("express");
const router = express.Router();
const controller = require("../controllers/gamesController");

router.get("/", controller.getGames);
router.get("/:id", controller.getGameDetails);
router.get("/:id/screenshots", controller.getScreenshots);
router.get("/:id/stores", controller.getStores);

router.get("/:id/similar", async (req, res) => {
  try {
    const rawgClient = require("../service/rawgService");
    const { id } = req.params;

    // 1️⃣ Get current game
    const gameRes = await rawgClient.get(`/games/${id}`);
    const genres = gameRes.data.genres?.map(g => g.slug);

    if (!genres || genres.length === 0) {
      return res.json({ results: [] });
    }

    // 2️⃣ Fetch similar by genre
    const similarRes = await rawgClient.get("/games", {
      params: {
        genres: genres.join(","),
        page_size: 12,
        exclude_additions: true,
      },
    });

    // 3️⃣ Remove current game from results
    const filtered = similarRes.data.results.filter(
      g => g.id.toString() !== id
    );

    res.json({ results: filtered });
  } catch (err) {
    console.error("Similar games error:", err.message);
    res.json({ results: [] }); // NEVER crash frontend
  }
});


module.exports = router;
