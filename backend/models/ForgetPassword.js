const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Each password-reset request. The UUID `id` is the secret in the emailed link.
// A request stops working when it is used (isActive=false) or older than 15 minutes.
const ForgetPassword = sequelize.define(
  "ForgetPassword",
  {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { tableName: "ForgetPasswords", timestamps: true }
);

module.exports = ForgetPassword;
