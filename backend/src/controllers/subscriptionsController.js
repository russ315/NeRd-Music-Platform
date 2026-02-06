const Subscription = require("../models/Subscription");

const getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user.id });
    if (!subscription) {
      return res.json({ status: "inactive", plan: "monthly" });
    }
    return res.json(subscription);
  } catch (error) {
    return next(error);
  }
};

const updateSubscription = async (req, res, next) => {
  try {
    const { status, plan } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (plan) updates.plan = plan;

    if (status === "active") {
      updates.startedAt = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      updates.expiresAt = expiresAt;
    }

    const subscription = await Subscription.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates, $setOnInsert: { userId: req.user.id } },
      { new: true, upsert: true }
    );

    return res.json(subscription);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getSubscription, updateSubscription };
