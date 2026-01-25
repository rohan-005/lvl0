const express = require("express");
const router = express.Router();
const controller = require("../controllers/gamesController");

router.get("/", controller.getGames);
router.get("/:id", controller.getGameDetails);
router.get("/:id/screenshots", controller.getScreenshots);
router.get("/:id/stores", controller.getStores);

module.exports = router;
