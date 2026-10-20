const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth.middleware");
const { getLeaderboard } = require("../controllers/leaderboard.controller");

router.get("/", verifyToken, getLeaderboard);

module.exports = router;
