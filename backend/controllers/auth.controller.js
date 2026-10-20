// Register + Login
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // 2. Email must be unique
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // 3. Hash the password (never store plain text) and create the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST /api/auth/login  (rate limited in auth.routes.js)
const login = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Same message for "no such user" and "wrong password" so attackers
    // can't discover which emails are registered.
    const invalid = () => res.status(401).json({ message: "Invalid email or password" });

    const user = await User.findOne({ where: { email } });
    if (!user) return invalid();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return invalid();

    // JWT valid for 1 day
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, isPrime: user.isPrime },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, isPrime: user.isPrime },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { register, login };
