const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    isPublic: { type: Boolean, default: false },
    trackIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Track" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Playlist", playlistSchema);
