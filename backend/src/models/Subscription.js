const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    status: { type: String, default: "inactive" },
    plan: { type: String, default: "monthly" },
    startedAt: { type: Date },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
