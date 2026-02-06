const express = require("express");

const auth = require("../middlewares/auth");
const { getFavorites, addFavorite, removeFavorite } = require("../controllers/favoritesController");

const router = express.Router();

router.get("/", auth, getFavorites);
router.post("/", auth, addFavorite);
router.delete("/:trackId", auth, removeFavorite);

module.exports = router;
