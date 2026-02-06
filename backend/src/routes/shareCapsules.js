const express = require("express");

const auth = require("../middlewares/auth");
const {
  createShareCapsule,
  getShareCapsuleByCode
} = require("../controllers/shareCapsulesController");

const router = express.Router();

router.post("/", auth, createShareCapsule);
router.get("/:shareCode", getShareCapsuleByCode);

module.exports = router;
