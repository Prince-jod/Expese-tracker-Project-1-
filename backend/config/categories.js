// Single source of truth for expense categories.
// Used by the Expense model (ENUM), the Gemini service and the controller,
// so adding a category here updates all three.
const CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Education",
  "Other",
];

module.exports = CATEGORIES;
