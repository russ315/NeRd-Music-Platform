const express = require("express");

const auth = require("../middlewares/auth");
const { createTrack, getTrackById } = require("../controllers/tracksController");

const router = express.Router();

router.post("/", auth, createTrack);
router.get("/:id", getTrackById);

module.exports = router;
