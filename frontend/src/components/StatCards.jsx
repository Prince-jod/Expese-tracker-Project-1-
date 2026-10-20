// The four summary cards at the top of the dashboard.
import { Wallet, CalendarDays, ReceiptText, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { formatMoney } from "../utils/format.js";
import { CATEGORY_META } from "../utils/categories.js";

function Card({ icon: Icon, label, value, hint, tone }) {
  return (
    <div className="card stat-card">
      <span className={`stat-icon tone-${tone}`}>
        <Icon size={22} />
      </span>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {hint}
      </div>
    </div>
  );
}

export default function StatCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="card skeleton" style={{ height: 96 }} />
        ))}
      </div>
    );
  }

  // "+12% vs last month" with an up/down arrow (spending up = red, down = green)
  const changeHint =
    stats.change === null ? (
      <small className="muted">No data for last month</small>
    ) : (
      <small className={stats.change > 0 ? "text-danger" : "text-success"}>
        {stats.change > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{" "}
        {Math.abs(stats.change).toFixed(0)}% vs last month
      </small>
    );

  const TopIcon = stats.top ? CATEGORY_META[stats.top.name]?.icon : Trophy;

  return (
    <div className="grid-4">
      <Card icon={Wallet} tone="indigo" label="Total spent" value={formatMoney(stats.total)} hint={<small className="muted">All time</small>} />
      <Card icon={CalendarDays} tone="violet" label="This month" value={formatMoney(stats.thisMonth)} hint={changeHint} />
      <Card icon={ReceiptText} tone="sky" label="Transactions" value={stats.count} hint={<small className="muted">Recorded expenses</small>} />
      <Card
        icon={TopIcon || Trophy}
        tone="amber"
        label="Top category"
        value={stats.top ? stats.top.name : "-"}
        hint={<small className="muted">{stats.top ? formatMoney(stats.top.value) : "Add an expense"}</small>}
      />
    </div>
  );
}
