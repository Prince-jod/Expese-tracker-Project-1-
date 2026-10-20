// Forgot password -> email link -> reset password.
// The reset page itself is now a React page (/reset-password/:id);
// these endpoints just return JSON.
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const ForgetPassword = require("../models/ForgetPassword");
const { sendForgotPasswordEmail } = require("../services/emailService");

const LINK_VALID_MS = 15 * 60 * 1000; // reset links expire after 15 minutes

// Finds a reset request that is still active and not expired. Returns null otherwise.
const findValidRequest = async (id) => {
  const request = await ForgetPassword.findOne({ where: { id, isActive: true } });
  if (!request) return null;

  if (Date.now() - new Date(request.createdAt).getTime() > LINK_VALID_MS) {
    await request.update({ isActive: false }); // expired -> disable it
    return null;
  }
  return request;
};

// POST /api/password/forgetpassword   body: { email }
const forgetPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Always answer with the same message, whether the email exists or not,
    // so nobody can use this form to find out who has an account.
    const genericReply = {
      message: "If an account exists for that email, a reset link has been sent.",
    };

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(200).json(genericReply);

    // Disable any older unused links for this user, then create a fresh one
    await ForgetPassword.update(
      { isActive: false },
      { where: { userId: user.id, isActive: true } }
    );
    const request = await ForgetPassword.create({
      id: crypto.randomUUID(),
      userId: user.id,
      isActive: true,
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${request.id}`;

    try {
      await sendForgotPasswordEmail(email, resetUrl);
    } catch (emailError) {
      // Never send the link back in the response - that would let anyone reset any account.
      console.error("Email Error:", emailError);
      if (process.env.NODE_ENV !== "production") {
        console.log("DEV ONLY - reset link:", resetUrl);
      }
    }

    return res.status(200).json(genericReply);
  } catch (error) {
    console.error("Forget Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /api/password/resetpassword/:id  -> lets the React page check the link before showing the form
const validateResetLink = async (req, res) => {
  try {
    const request = await findValidRequest(req.params.id);
    if (!request) {
      return res.status(400).json({ message: "Invalid or expired password reset link" });
    }
    return res.status(200).json({ valid: true });
  } catch (error) {
    console.error("Validate Reset Link Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST /api/password/resetpassword/:id   body: { password }
const resetPassword = async (req, res) => {
  try {
    const password = String(req.body.password || "");
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const request = await findValidRequest(req.params.id);
    if (!request) {
      return res.status(400).json({ message: "Invalid or expired password reset link" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.update({ password: hashedPassword }, { where: { id: request.userId } });

    // The link is single-use: disable it (and any other open links of this user)
    await ForgetPassword.update(
      { isActive: false },
      { where: { userId: request.userId, isActive: true } }
    );

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { forgetPassword, validateResetLink, resetPassword };
