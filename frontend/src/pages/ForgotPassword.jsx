// Step 1 of password reset: user enters email -> backend emails a reset link.
// The endpoint is rate limited (3 emails / hour) and always gives the same answer.
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, AlertCircle, MailCheck, ArrowLeft } from "lucide-react";
import api, { getErrorMessage } from "../api/axios.js";
import AuthLayout from "../components/AuthLayout.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/password/forgetpassword", { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot password?" subtitle="We'll email you a link to reset it.">
      {sent ? (
        // Success state
        <div className="state-box">
          <span className="state-icon success"><MailCheck size={30} /></span>
          <h3>Check your inbox</h3>
          <p>If an account exists for <b>{email}</b>, a reset link is on its way. It is valid for 15 minutes.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="form">
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} /> {error}
            </div>
          )}
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : "Send reset link"}
          </button>
        </form>
      )}

      <p className="auth-switch">
        <Link to="/login" className="link"><ArrowLeft size={14} /> Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
