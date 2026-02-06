const express = require("express");

const auth = require("../middlewares/auth");
const { getClipsByTrack, addClipToTrack } = require("../controllers/videoClipsController");

const router = express.Router();

router.get("/:id/clips", getClipsByTrack);
router.post("/:id/clips", auth, addClipToTrack);

module.exports = router;
