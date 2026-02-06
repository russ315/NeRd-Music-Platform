const Favorite = require("../models/Favorite");

const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("trackId");
    return res.json(favorites);
  } catch (error) {
    return next(error);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    const { trackId } = req.body;
    if (!trackId) {
      return res.status(400).json({ message: "trackId is required" });
    }

    const favorite = await Favorite.create({ userId: req.user.id, trackId });
    return res.status(201).json(favorite);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Already in favorites" });
    }
    return next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    await Favorite.findOneAndDelete({
      userId: req.user.id,
      trackId: req.params.trackId
    });
    return res.json({ message: "Removed from favorites" });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite };
