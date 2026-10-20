// Cashfree payment gateway client.
// CASHFREE_ENV=SANDBOX (testing) or PRODUCTION (real money).
const { Cashfree } = require("cashfree-pg");
require("dotenv").config();

const environment =
  process.env.CASHFREE_ENV === "PRODUCTION"
    ? Cashfree.PRODUCTION
    : Cashfree.SANDBOX;

const cashfree = new Cashfree(
  environment,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);

module.exports = cashfree;
