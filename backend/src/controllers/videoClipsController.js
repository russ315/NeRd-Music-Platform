const VideoClip = require("../models/VideoClip");

const getClipsByTrack = async (req, res, next) => {
  try {
    const clips = await VideoClip.find({ trackId: req.params.id }).sort({ createdAt: -1 });
    return res.json(clips);
  } catch (error) {
    return next(error);
  }
};

const addClipToTrack = async (req, res, next) => {
  try {
    const { title, videoUrl, source } = req.body;
    if (!title || !videoUrl) {
      return res.status(400).json({ message: "title and videoUrl are required" });
    }

    const clip = await VideoClip.create({
      trackId: req.params.id,
      title,
      videoUrl,
      source: source || "youtube"
    });

    return res.status(201).json(clip);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getClipsByTrack, addClipToTrack };
