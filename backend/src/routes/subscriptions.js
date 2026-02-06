const express = require("express");

const auth = require("../middlewares/auth");
const { getSubscription, updateSubscription } = require("../controllers/subscriptionsController");

const router = express.Router();

router.get("/", auth, getSubscription);
router.put("/", auth, updateSubscription);

module.exports = router;
