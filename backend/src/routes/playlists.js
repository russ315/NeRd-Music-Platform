const express = require("express");

const auth = require("../middlewares/auth");
const {
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist
} = require("../controllers/playlistsController");

const router = express.Router();

router.post("/", auth, createPlaylist);
router.get("/", auth, getPlaylists);
router.get("/:id", auth, getPlaylistById);
router.put("/:id", auth, updatePlaylist);
router.delete("/:id", auth, deletePlaylist);
router.post("/:id/tracks", auth, addTrackToPlaylist);
router.delete("/:id/tracks/:trackId", auth, removeTrackFromPlaylist);

module.exports = router;
