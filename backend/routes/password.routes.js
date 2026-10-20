const express = require("express");
const router = express.Router();
const {
  forgetPassword,
  validateResetLink,
  resetPassword,
} = require("../controllers/password.controller");
const {
  forgotPasswordLimiters,
  resetSubmitLimiter,
} = require("../middlewares/rateLimiter");

router.post("/forgetpassword", ...forgotPasswordLimiters, forgetPassword); // rate limited
router.get("/resetpassword/:id", validateResetLink);
router.post("/resetpassword/:id", resetSubmitLimiter, resetPassword); // rate limited

module.exports = router;
