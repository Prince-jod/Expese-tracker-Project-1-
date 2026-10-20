// Sticky top bar: logo, premium badge/button, theme toggle, user and logout.
import { Crown, Sun, Moon, LogOut, Loader2 } from "lucide-react";
import Logo from "./Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Navbar({ onUpgrade, upgrading }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Logo size={34} />

        <div className="navbar-right">
          {user.isPrime ? (
            <span className="badge-pro">
              <Crown size={14} /> PRO
            </span>
          ) : (
            <button className="btn btn-gold btn-sm" onClick={onUpgrade} disabled={upgrading}>
              {upgrading ? <Loader2 size={15} className="spin" /> : <Crown size={15} />}
              <span className="hide-sm">Go Premium</span>
            </button>
          )}

          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="user-chip">
            <span className="avatar">{user.name?.[0]?.toUpperCase() || "U"}</span>
            <span className="hide-sm">{user.name}</span>
          </div>

          <button className="icon-btn" onClick={logout} aria-label="Log out" title="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
