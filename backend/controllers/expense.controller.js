// CRUD for expenses. Every query is scoped to the logged-in user (req.user.id).
const Expense = require("../models/Expense");
const CATEGORIES = require("../config/categories");
const { categorizeExpense } = require("../services/geminiService");

// Loads an expense and makes sure it belongs to the logged-in user.
// Returns the expense, or sends the error response and returns null.
const getOwnedExpense = async (req, res) => {
  const expense = await Expense.findByPk(req.params.id);
  if (!expense) {
    res.status(404).json({ message: "Expense does not exist" });
    return null;
  }
  if (expense.userId !== req.user.id) {
    res.status(403).json({ message: "You are not allowed to access this expense" });
    return null;
  }
  return expense;
};

// POST /api/expenses
const createExpense = async (req, res) => {
  try {
    const { title, amount, date, name, category } = req.body;

    if (!title || !amount || !date) {
      return res.status(400).json({ message: "Title, amount and date are required" });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Use the category the user picked; if they chose "Auto" (or nothing),
    // let Gemini decide. If the AI call fails we still save the expense as "Other".
    let finalCategory = category;
    if (!CATEGORIES.includes(finalCategory)) {
      try {
        finalCategory = await categorizeExpense(title);
      } catch (aiError) {
        console.error("Gemini Error:", aiError.message);
        finalCategory = "Other";
      }
    }

    const expense = await Expense.create({
      userId: req.user.id,
      title: String(title).trim(),
      amount,
      category: finalCategory,
      date,
      name: String(name || "").trim() || req.user.name,
    });

    return res.status(201).json({ message: "Expense added successfully", expense });
  } catch (error) {
    console.error("Create Expense Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /api/expenses  -> only this user's expenses, newest first
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      order: [
        ["date", "DESC"],
        ["id", "DESC"],
      ],
    });
    return res.status(200).json({ message: "Expenses fetched successfully", expenses });
  } catch (error) {
    console.error("Get Expenses Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /api/expenses/:id
const getExpenseById = async (req, res) => {
  try {
    const expense = await getOwnedExpense(req, res);
    if (!expense) return;
    return res.status(200).json({ message: "Expense exists", expense });
  } catch (error) {
    console.error("Get Expense Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// PUT /api/expenses/:id
const updateExpense = async (req, res) => {
  try {
    const expense = await getOwnedExpense(req, res);
    if (!expense) return;

    // Only update the fields that were actually sent
    const { title, amount, category, date, name } = req.body;
    const changes = {};
    if (title !== undefined) changes.title = String(title).trim();
    if (amount !== undefined) {
      if (Number(amount) <= 0) {
        return res.status(400).json({ message: "Amount must be greater than 0" });
      }
      changes.amount = amount;
    }
    if (category !== undefined && CATEGORIES.includes(category)) changes.category = category;
    if (date !== undefined) changes.date = date;
    if (name !== undefined) changes.name = String(name).trim() || req.user.name;

    await expense.update(changes);
    return res.status(200).json({ message: "Expense updated successfully", expense });
  } catch (error) {
    console.error("Update Expense Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const expense = await getOwnedExpense(req, res);
    if (!expense) return;
    await expense.destroy();
    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete Expense Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
