// Defines the relationships between tables. Imported once in server.js.
const User = require("./User");
const Expense = require("./Expense");
const Order = require("./Order");
const ForgetPassword = require("./ForgetPassword");

// One user has many expenses / orders / reset requests
User.hasMany(Expense, { foreignKey: "userId" });
Expense.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

User.hasMany(ForgetPassword, { foreignKey: "userId" });
ForgetPassword.belongsTo(User, { foreignKey: "userId" });

module.exports = { User, Expense, Order, ForgetPassword };
