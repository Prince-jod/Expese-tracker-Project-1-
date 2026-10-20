// The SpendWise logo: a gradient tile with rising bars (spending chart) and a gold coin.
// To rename the app, change the text below and the <title> in index.html.
export default function Logo({ size = 36, withText = true, light = false }) {
  return (
    <span className="logo" style={{ color: light ? "#fff" : "var(--text)" }}>
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6366f1" />
            <stop offset="0.6" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#d946ef" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="13" fill={light ? "rgba(255,255,255,.2)" : "url(#logoGrad)"} />
        <rect x="11" y="26" width="6" height="11" rx="2" fill="#fff" opacity=".7" />
        <rect x="21" y="19" width="6" height="18" rx="2" fill="#fff" opacity=".85" />
        <rect x="31" y="12" width="6" height="25" rx="2" fill="#fff" />
        <circle cx="36" cy="10" r="4" fill="#fde68a" />
      </svg>
      {withText && (
        <span className="logo-text">
          Spend<span className="logo-accent">Wise</span>
        </span>
      )}
    </span>
  );
}
