const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    avatarColor: { type: String, default: "#6c63ff" },
    bio: { type: String, default: "" },
    settings: {
      notifications: { type: Boolean, default: true },
      autoplay: { type: Boolean, default: true },
      privacy: { type: String, default: "public" }
    },
    stats: {
      favoritesCount: { type: Number, default: 0 },
      playlistsCount: { type: Number, default: 0 },
      listenMinutes: { type: Number, default: 0 },
      avgRating: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
