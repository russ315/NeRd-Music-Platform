const Track = require("../models/Track");

const createTrack = async (req, res, next) => {
  try {
    const {
      externalId,
      title,
      artist,
      album,
      img,
      previewUrl,
      duration,
      genre,
      source,
      externalUrl
    } = req.body;

    if (!title || !artist) {
      return res.status(400).json({ message: "title and artist are required" });
    }

    if (externalId && source) {
      const existing = await Track.findOne({ externalId, source });
      if (existing) {
        return res.json(existing);
      }
    }

    const track = await Track.create({
      externalId,
      title,
      artist,
      album,
      img,
      previewUrl,
      duration,
      genre,
      source,
      externalUrl
    });

    return res.status(201).json(track);
  } catch (error) {
    if (error.code === 11000) {
      const existing = await Track.findOne({
        externalId: req.body.externalId,
        source: req.body.source
      });
      if (existing) {
        return res.json(existing);
      }
    }
    return next(error);
  }
};

const getTrackById = async (req, res, next) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }
    return res.json(track);
  } catch (error) {
    return next(error);
  }
};

module.exports = { createTrack, getTrackById };
