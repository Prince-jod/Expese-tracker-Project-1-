const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");
const { loginLimiters } = require("../middlewares/rateLimiter");

router.post("/register", register);
router.post("/login", ...loginLimiters, login); // rate limited

module.exports = router;
