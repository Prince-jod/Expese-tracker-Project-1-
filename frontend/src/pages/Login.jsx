// Login page. Calls POST /api/auth/login (rate limited on the server).
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Mail, Loader2, AlertCircle } from "lucide-react";
import api, { getErrorMessage } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import AuthLayout from "../components/AuthLayout.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Already signed in? Skip the login page.
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });
      login(data.token, data.user); // save session
      navigate("/dashboard");
    } catch (err) {
      // Shows "Invalid email or password" or the 429 "try again in X min" message
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your dashboard.">
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
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <PasswordInput
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="current-password"
        />

        <div className="form-row-end">
          <Link to="/forgot-password" className="link">
            Forgot password?
          </Link>
        </div>

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? <Loader2 size={18} className="spin" /> : "Sign in"}
        </button>

        <p className="auth-switch">
          New here? <Link to="/signup" className="link">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
