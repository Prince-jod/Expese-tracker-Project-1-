// ---------------------------------------------------------------
// RATE LIMITING for the sensitive routes (login + password reset).
// Stops brute-force password guessing and email-bombing.
//
// Two layers are used:
//   1. per IP + email  -> protects a single account
//   2. per IP          -> stops one machine trying many different emails
//
// When a limit is hit the API answers 429 with a "retryAfter" (seconds),
// which the React app shows as a friendly countdown message.
// ---------------------------------------------------------------
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const MINUTE = 60 * 1000;

// Builds the JSON response sent when a client is blocked.
const buildHandler = (message) => (req, res) => {
  const retryAfter = Math.max(
    1,
    Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000)
  );
  res.status(429).json({ message, retryAfter });
};

// Key = IP (IPv6-safe) + the email typed in the form
const ipAndEmailKey = (req) => {
  const email = String(req.body?.email || "").toLowerCase().trim();
  return `${ipKeyGenerator(req.ip)}|${email}`;
};

// ----- LOGIN -----
// Max 5 FAILED attempts per 15 min for the same IP + email (successful logins don't count).
const loginAccountLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: ipAndEmailKey,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: buildHandler("Too many failed login attempts."),
});

// Max 30 login requests per 15 min from one IP, whatever the email.
const loginIpLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  limit: 30,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: buildHandler("Too many login requests from this device."),
});

// ----- FORGOT PASSWORD (sends an email) -----
// Max 3 reset emails per hour for the same IP + email.
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * MINUTE,
  limit: 3,
  keyGenerator: ipAndEmailKey,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: buildHandler("Too many reset requests."),
});

// Max 10 reset emails per hour from one IP.
const forgotPasswordIpLimiter = rateLimit({
  windowMs: 60 * MINUTE,
  limit: 10,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: buildHandler("Too many reset requests from this device."),
});

// ----- SUBMITTING THE NEW PASSWORD -----
// Max 10 attempts per 15 min per IP (the link itself is an unguessable UUID).
const resetSubmitLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  limit: 10,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: buildHandler("Too many attempts."),
});

module.exports = {
  loginLimiters: [loginIpLimiter, loginAccountLimiter],
  forgotPasswordLimiters: [forgotPasswordIpLimiter, forgotPasswordLimiter],
  resetSubmitLimiter,
};
