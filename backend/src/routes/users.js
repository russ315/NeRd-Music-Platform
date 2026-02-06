const express = require("express");

const auth = require("../middlewares/auth");
const { getMe, updateMe, getProfile, updateProfile } = require("../controllers/usersController");

const router = express.Router();

router.get("/me", auth, getMe);
router.put("/me", auth, updateMe);
router.get("/me/profile", auth, getProfile);
router.put("/me/profile", auth, updateProfile);

module.exports = router;
