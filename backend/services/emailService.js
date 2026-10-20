// Sends the password reset email through Brevo (transactional email API).
const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

const sendForgotPasswordEmail = async (email, resetUrl) => {
  return brevo.transactionalEmails.sendTransacEmail({
    subject: "Reset your Expense Tracker password",
    htmlContent: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2>Password Reset</h2>
        <p>We received a request to reset your password.</p>
        <p>This link is valid for <b>15 minutes</b>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#6366f1;
                  color:#fff;text-decoration:none;border-radius:8px">
          Reset Password
        </a>
        <p style="color:#888;font-size:13px">
          If you did not request this, you can safely ignore this email.
        </p>
      </div>`,
    sender: { name: "Expense Tracker", email: process.env.BREVO_SENDER_EMAIL },
    to: [{ email }],
  });
};

module.exports = { sendForgotPasswordEmail };
