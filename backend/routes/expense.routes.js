const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth.middleware");
const {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require("../controllers/expense.controller");

router.use(verifyToken); // every expense route needs a valid login token

router.post("/", createExpense);
router.get("/", getAllExpenses);
router.get("/:id", getExpenseById);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;
