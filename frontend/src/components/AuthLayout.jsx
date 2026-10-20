// Shared layout for Login / Signup / Forgot / Reset pages:
// brand panel on the left (hidden on phones) + the form card on the right.
import { PieChart, Sparkles, ShieldCheck, Crown, Sun, Moon } from "lucide-react";
import Logo from "./Logo.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const features = [
  { icon: PieChart, title: "Visual insights", text: "Charts that show where your money goes." },
  { icon: Sparkles, title: "AI categories", text: "Gemini sorts every expense for you." },
  { icon: ShieldCheck, title: "Secure by design", text: "Hashed passwords and rate-limited logins." },
  { icon: Crown, title: "Premium extras", text: "Leaderboard and PDF / CSV export." },
];

export default function AuthLayout({ title, subtitle, children }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="auth-page">
      {/* Left: brand panel */}
      <aside className="auth-brand">
        <Logo light size={42} />
        <h1>Take control of every rupee.</h1>
        <p>Track spending, set budgets and understand your habits in one beautiful place.</p>
        <ul>
          {features.map(({ icon: Icon, title: t, text }) => (
            <li key={t}>
              <span className="auth-feature-icon">
                <Icon size={20} />
              </span>
              <div>
                <strong>{t}</strong>
                <small>{text}</small>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Right: form */}
      <main className="auth-main">
        <button className="icon-btn auth-theme" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="auth-card">
          <div className="auth-mobile-logo">
            <Logo size={40} />
          </div>
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
