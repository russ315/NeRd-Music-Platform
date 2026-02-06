const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trackId: { type: mongoose.Schema.Types.ObjectId, ref: "Track", required: true }
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, trackId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
