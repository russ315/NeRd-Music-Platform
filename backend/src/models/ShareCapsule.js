const mongoose = require("mongoose");

const shareCapsuleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    trackIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Track" }],
    shareCode: { type: String, unique: true, required: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShareCapsule", shareCapsuleSchema);
