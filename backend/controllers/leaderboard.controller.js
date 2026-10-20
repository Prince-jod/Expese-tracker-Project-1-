// Premium feature: total spent grouped by the "name" typed on each expense.
const { Op } = require("sequelize");
const Expense = require("../models/Expense");
const User = require("../models/User");

// GET /api/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    // Only premium users can see the leaderboard (checked in the DB, not the token,
    // so it is correct right after buying premium).
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isPrime) {
      return res.status(403).json({ message: "Premium membership required" });
    }

    const { fn, col, where, literal } = Expense.sequelize;

    const leaderboard = await Expense.findAll({
      attributes: ["name", [fn("SUM", col("amount")), "totalExpense"]],
      where: {
        userId: req.user.id,
        // ignore empty / space-only names
        [Op.and]: [where(fn("TRIM", col("name")), { [Op.ne]: "" })],
      },
      group: ["name"], // same name = same leaderboard row
      order: [[literal("totalExpense"), "DESC"]], // highest total first
    });

    return res.status(200).json({ message: "Leaderboard fetched successfully", leaderboard });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getLeaderboard };
