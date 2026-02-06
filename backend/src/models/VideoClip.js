const mongoose = require("mongoose");

const videoClipSchema = new mongoose.Schema(
  {
    trackId: { type: mongoose.Schema.Types.ObjectId, ref: "Track", required: true },
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    source: { type: String, default: "youtube" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("VideoClip", videoClipSchema);
