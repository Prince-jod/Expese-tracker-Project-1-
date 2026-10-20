// Premium membership payment using Cashfree.
// Flow: create-order (backend) -> checkout modal (frontend) -> verify (backend).
const Order = require("../models/Order");
const User = require("../models/User");
const cashfree = require("../config/cashfree");

const PREMIUM_PRICE = Number(process.env.PREMIUM_PRICE) || 12299;

// POST /api/payment/create-order
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Save our own order as PENDING
    const order = await Order.create({
      orderId: `ORDER_${Date.now()}_${userId}`,
      userId,
      amount: PREMIUM_PRICE,
      status: "PENDING",
    });

    // 2. Create the same order on Cashfree
    const response = await cashfree.PGCreateOrder({
      order_amount: PREMIUM_PRICE,
      order_currency: "INR",
      order_id: order.orderId,
      customer_details: {
        customer_id: String(userId),
        customer_phone: "9999999999", // placeholder - Cashfree needs a phone number
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL}/dashboard?order_id={order_id}`,
      },
    });

    return res.status(201).json({
      message: "Cashfree order created successfully",
      orderId: order.orderId,
      paymentSessionId: response.data.payment_session_id,
    });
  } catch (error) {
    console.error("Cashfree order error:", error.response?.data || error.message);
    return res.status(500).json({ message: "Failed to create Cashfree order" });
  }
};

// POST /api/payment/verify   body: { orderId }
const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // The order must belong to the logged-in user
    const order = await Order.findOne({ where: { orderId, userId: req.user.id } });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Ask Cashfree (not the browser) whether the payment really succeeded
    const response = await cashfree.PGOrderFetchPayments(orderId);
    const payments = response.data || [];

    const paid = payments.some((p) => p.payment_status === "SUCCESS");

    if (paid) {
      await order.update({ status: "SUCCESSFUL" });
      await User.update({ isPrime: true }, { where: { id: req.user.id } });
      return res.status(200).json({ message: "Transaction successful", status: "SUCCESSFUL" });
    }

    // No payment attempt at all (e.g. the user closed the popup) -> keep it pending
    if (payments.length === 0) {
      return res.status(200).json({ message: "Payment not completed", status: "PENDING" });
    }

    await order.update({ status: "FAILED" });
    return res.status(200).json({ message: "Transaction failed", status: "FAILED" });
  } catch (error) {
    console.error("Payment verification error:", error.response?.data || error.message);
    return res.status(500).json({ message: "Unable to verify payment" });
  }
};

module.exports = { createOrder, verifyPayment };
