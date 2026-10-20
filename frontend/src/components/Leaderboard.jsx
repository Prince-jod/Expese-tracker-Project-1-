// Premium: total spent per "Spent by" name, ranked with medals and bars.
import { Trophy, Medal } from "lucide-react";
import { formatMoney } from "../utils/format.js";

const medalColors = ["#f59e0b", "#94a3b8", "#b45309"]; // gold, silver, bronze

export default function Leaderboard({ items }) {
  const max = Math.max(...items.map((i) => Number(i.totalExpense)), 1);

  return (
    <div className="card">
      <div className="card-head">
        <h3><Trophy size={18} className="text-gold" /> Leaderboard</h3>
        <span className="badge-pro small">PRO</span>
      </div>

      {items.length === 0 ? (
        <p className="muted">Add expenses with a name to see the ranking.</p>
      ) : (
        <ol className="leaders">
          {items.map((item, index) => (
            <li key={item.name}>
              <span className="rank">
                {index < 3 ? <Medal size={22} color={medalColors[index]} /> : index + 1}
              </span>
              <div className="leader-body">
                <div className="leader-top">
                  <strong>{item.name}</strong>
                  <span>{formatMoney(item.totalExpense)}</span>
                </div>
                <div className="progress">
                  <div className="progress-bar ok" style={{ width: `${(Number(item.totalExpense) / max) * 100}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
