// Signup page. Calls POST /api/auth/register.
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Mail, User, Loader2, AlertCircle } from "lucide-react";
import api, { getErrorMessage } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import AuthLayout from "../components/AuthLayout.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

// Simple strength score 0-4 for the coloured bar under the password field
const strength = (pw) =>
  [pw.length >= 6, pw.length >= 10, /[A-Z]/.test(pw) && /[a-z]/.test(pw), /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;

const strengthLabels = ["Too short", "Weak", "Okay", "Good", "Strong"];

export default function Signup() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate to="/dashboard" replace />;

  const score = form.password ? strength(form.password) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start tracking your expenses in minutes.">
      <form onSubmit={handleSubmit} className="form">
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="input-group">
          <User size={18} className="input-icon" />
          <input
            type="text"
            placeholder="Full name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

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
          placeholder="Create a password"
          autoComplete="new-password"
        />

        {/* Password strength meter */}
        {form.password && (
          <div className="strength">
            <div className="strength-bars">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className={n <= score ? `on s${score}` : ""} />
              ))}
            </div>
            <small>{strengthLabels[score]}</small>
          </div>
        )}

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? <Loader2 size={18} className="spin" /> : "Create account"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login" className="link">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
