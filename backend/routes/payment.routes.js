const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth.middleware");
const { createOrder, verifyPayment } = require("../controllers/payment.controller");

router.post("/create-order", verifyToken, createOrder);
router.post("/verify", verifyToken, verifyPayment);

module.exports = router;
