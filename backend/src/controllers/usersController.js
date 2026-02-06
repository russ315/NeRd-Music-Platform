const User = require("../models/User");
const Profile = require("../models/Profile");

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { username, email } = req.body;
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email.toLowerCase();

    if (updates.email) {
      const exists = await User.findOne({ email: updates.email, _id: { $ne: req.user.id } });
      if (exists) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true
    }).select("-passwordHash");

    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    return res.json(profile);
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { avatarColor, bio, settings } = req.body;

    const updates = {};
    if (avatarColor) updates.avatarColor = avatarColor;
    if (bio !== undefined) updates.bio = bio;
    if (settings) updates.settings = settings;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      updates,
      { new: true }
    );

    return res.json(profile);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getMe, updateMe, getProfile, updateProfile };
