const Playlist = require("../models/Playlist");

const createPlaylist = async (req, res, next) => {
  try {
    const { title, description, isPublic, trackIds } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const playlist = await Playlist.create({
      userId: req.user.id,
      title,
      description: description || "",
      isPublic: Boolean(isPublic),
      trackIds: trackIds || []
    });

    return res.status(201).json(playlist);
  } catch (error) {
    return next(error);
  }
};

const getPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.id })
      .populate("trackIds")
      .sort({ createdAt: -1 });
    return res.json(playlists);
  } catch (error) {
    return next(error);
  }
};

const getPlaylistById = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate("trackIds");
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    if (!playlist.isPublic && playlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    return res.json(playlist);
  } catch (error) {
    return next(error);
  }
};

const updatePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    if (playlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, description, isPublic } = req.body;
    if (title !== undefined) playlist.title = title;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = Boolean(isPublic);

    await playlist.save();
    await playlist.populate("trackIds");
    return res.json(playlist);
  } catch (error) {
    return next(error);
  }
};

const deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    if (playlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await playlist.deleteOne();
    return res.json({ message: "Playlist removed" });
  } catch (error) {
    return next(error);
  }
};

const addTrackToPlaylist = async (req, res, next) => {
  try {
    const { trackId } = req.body;
    if (!trackId) {
      return res.status(400).json({ message: "trackId is required" });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    if (playlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!playlist.trackIds.some((id) => id.toString() === trackId)) {
      playlist.trackIds.push(trackId);
      await playlist.save();
    }

    await playlist.populate("trackIds");
    return res.json(playlist);
  } catch (error) {
    return next(error);
  }
};

const removeTrackFromPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    if (playlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    playlist.trackIds = playlist.trackIds.filter(
      (trackId) => trackId.toString() !== req.params.trackId
    );
    await playlist.save();
    await playlist.populate("trackIds");
    return res.json(playlist);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist
};
