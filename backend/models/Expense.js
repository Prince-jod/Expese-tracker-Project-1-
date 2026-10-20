const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const CATEGORIES = require("../config/categories");

// expenses table. `name` is who the money was spent by/for (used by the leaderboard).
const Expense = sequelize.define(
  "Expense",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    category: {
      type: DataTypes.ENUM(...CATEGORIES),
      allowNull: false,
      defaultValue: "Other",
    },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  { tableName: "expenses", timestamps: true }
);

module.exports = Expense;
