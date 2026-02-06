const crypto = require("crypto");

const ShareCapsule = require("../models/ShareCapsule");

const createShareCode = () => {
  return crypto.randomBytes(4).toString("hex");
};

const createShareCapsule = async (req, res, next) => {
  try {
    const { title, trackIds, expiresInDays } = req.body;
    if (!title || !Array.isArray(trackIds) || trackIds.length === 0) {
      return res.status(400).json({ message: "title and trackIds are required" });
    }

    const days = Number.isFinite(expiresInDays) ? expiresInDays : 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Math.max(1, days));

    const shareCapsule = await ShareCapsule.create({
      userId: req.user.id,
      title,
      trackIds,
      shareCode: createShareCode(),
      expiresAt
    });

    return res.status(201).json(shareCapsule);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Share code conflict, retry" });
    }
    return next(error);
  }
};

const getShareCapsuleByCode = async (req, res, next) => {
  try {
    const capsule = await ShareCapsule.findOne({ shareCode: req.params.shareCode }).populate(
      "trackIds"
    );
    if (!capsule) {
      return res.status(404).json({ message: "Share capsule not found" });
    }
    if (capsule.expiresAt < new Date()) {
      return res.status(410).json({ message: "Share capsule expired" });
    }
    return res.json(capsule);
  } catch (error) {
    return next(error);
  }
};

module.exports = { createShareCapsule, getShareCapsuleByCode };
