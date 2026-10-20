const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// users table. `isPrime` flips to true after a successful premium payment.
const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true },
    },
    email: {
      type: DataTypes.STRING(300),
      allowNull: false,
      unique: true,
      validate: { isEmail: true, notEmpty: true },
    },
    password: {
      type: DataTypes.STRING, // stores the bcrypt hash, never the plain password
      allowNull: false,
      validate: { notEmpty: true },
    },
    isPrime: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: "users", timestamps: true }
);

module.exports = User;
