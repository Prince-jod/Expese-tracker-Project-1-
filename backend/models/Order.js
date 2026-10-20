const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// One row per premium purchase attempt (created as PENDING, updated after verification).
const Order = sequelize.define(
  "Order",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.STRING, allowNull: false, unique: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM("PENDING", "SUCCESSFUL", "FAILED"),
      defaultValue: "PENDING",
    },
  },
  { timestamps: true }
);

module.exports = Order;
