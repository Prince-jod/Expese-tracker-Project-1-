// Entry point of the API server.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const sequelize = require("./config/db");
require("./models/Association"); // registers all models + relations

const authRoutes = require("./routes/auth.routes");
const expenseRoutes = require("./routes/expense.routes");
const paymentRoutes = require("./routes/payment.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const passwordRoutes = require("./routes/password.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// When deployed behind a proxy (Render, Nginx...) this lets rate limiting see the real client IP
if (process.env.TRUST_PROXY) app.set("trust proxy", Number(process.env.TRUST_PROXY));

// ---------- Middleware ----------
app.use(helmet()); // sets safe HTTP headers
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// ---------- Routes ----------
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/password", passwordRoutes);

// Unknown API route
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// ---------- Start: connect to DB first, then listen ----------
sequelize
  .sync({ alter: process.env.DB_SYNC_ALTER === "true" })
  .then(() => {
    console.log("Database connected and models synced.");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Database Error:", err.message);
    process.exit(1);
  });
