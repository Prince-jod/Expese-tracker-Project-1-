// Upgrade call-to-action, shown to non-premium users.
import { Crown, Trophy, FileDown, Loader2 } from "lucide-react";

export default function PremiumBanner({ onUpgrade, upgrading }) {
  return (
    <div className="premium-banner">
      <div>
        <h3><Crown size={20} /> Unlock SpendWise Premium</h3>
        <p>
          <span><Trophy size={15} /> Spending leaderboard</span>
          <span><FileDown size={15} /> PDF &amp; CSV export</span>
        </p>
      </div>
      <button className="btn btn-light" onClick={onUpgrade} disabled={upgrading}>
        {upgrading ? <Loader2 size={18} className="spin" /> : "Upgrade now"}
      </button>
    </div>
  );
}
