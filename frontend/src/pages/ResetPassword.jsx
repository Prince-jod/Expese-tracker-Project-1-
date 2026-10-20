// Step 2 of password reset: opened from the email link (/reset-password/:id).
// 1) checks the link is still valid  2) lets the user choose a new password.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import api, { getErrorMessage } from "../api/axios.js";
import AuthLayout from "../components/AuthLayout.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

export default function ResetPassword() {
  const { id } = useParams();
  const [status, setStatus] = useState("checking"); // checking | valid | invalid | done
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check the link when the page opens
  useEffect(() => {
    api
      .get(`/password/resetpassword/${id}`)
      .then(() => setStatus("valid"))
      .catch(() => setStatus("invalid"));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/password/resetpassword/${id}`, { password });
      setStatus("done");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password for your account.">
      {status === "checking" && (
        <div className="state-box"><Loader2 size={30} className="spin" /></div>
      )}

      {status === "invalid" && (
        <div className="state-box">
          <span className="state-icon danger"><XCircle size={30} /></span>
          <h3>Link expired or invalid</h3>
          <p>Reset links work once and expire after 15 minutes.</p>
          <Link to="/forgot-password" className="btn btn-primary">Request a new link</Link>
        </div>
      )}

      {status === "done" && (
        <div className="state-box">
          <span className="state-icon success"><CheckCircle2 size={30} /></span>
          <h3>Password updated</h3>
          <p>You can now sign in with your new password.</p>
          <Link to="/login" className="btn btn-primary">Go to sign in</Link>
        </div>
      )}

      {status === "valid" && (
        <form onSubmit={handleSubmit} className="form">
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} /> {error}
            </div>
          )}
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            autoComplete="new-password"
          />
          <PasswordInput
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : "Reset password"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
