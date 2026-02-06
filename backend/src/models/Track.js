const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema(
  {
    externalId: { type: String, index: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, default: "" },
    img: { type: String, default: "" },
    previewUrl: { type: String, default: "" },
    duration: { type: Number, default: 0 },
    genre: { type: String, default: "" },
    source: { type: String, default: "local" },
    externalUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

trackSchema.index({ externalId: 1, source: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Track", trackSchema);
