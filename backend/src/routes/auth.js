const express = require("express");

const { register, login, logout } = require("../controllers/authController");
const auth = require("../middlewares/auth");
const { validate, schemas } = require("../middlewares/validation");

const router = express.Router();

// Регистрация с валидацией
router.post("/register", validate(schemas.register), register);

// Логин с валидацией
router.post("/login", validate(schemas.login), login);

// Logout без дополнительной валидации (только проверка токена)
router.post("/logout", auth, logout);

module.exports = router;
