// Monthly budget tracker. The budget is saved in the browser (localStorage) per user.
// The bar turns amber at 75% and red when the budget is exceeded.
import { useState } from "react";
import { Target, Pencil, Check, AlertTriangle } from "lucide-react";
import { formatMoney } from "../utils/format.js";

export default function BudgetCard({ userId, spent }) {
  const storageKey = `spendwise_budget_${userId}`;
  const [budget, setBudget] = useState(() => Number(localStorage.getItem(storageKey)) || 0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const save = () => {
    const value = Number(draft);
    if (value >= 0) {
      localStorage.setItem(storageKey, String(value));
      setBudget(value);
    }
    setEditing(false);
  };

  const percent = budget > 0 ? (spent / budget) * 100 : 0;
  const tone = percent >= 100 ? "danger" : percent >= 75 ? "warn" : "ok";

  return (
    <div className="card budget-card">
      <div className="card-head">
        <h3><Target size={18} /> Monthly budget</h3>

        {editing ? (
          <div className="budget-edit">
            <input
              type="number"
              min="0"
              autoFocus
              placeholder="e.g. 20000"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
            <button className="icon-btn" onClick={save} aria-label="Save budget">
              <Check size={18} />
            </button>
          </div>
        ) : (
          <button
            className="icon-btn"
            onClick={() => { setDraft(budget || ""); setEditing(true); }}
            aria-label="Edit budget"
          >
            <Pencil size={16} />
          </button>
        )}
      </div>

      {budget > 0 ? (
        <>
          <div className="budget-numbers">
            <strong>{formatMoney(spent)}</strong>
            <span className="muted">of {formatMoney(budget)}</span>
          </div>
          <div className="progress">
            <div className={`progress-bar ${tone}`} style={{ width: `${Math.min(percent, 100)}%` }} />
          </div>
          {tone === "danger" ? (
            <p className="budget-msg text-danger">
              <AlertTriangle size={15} /> Over budget by {formatMoney(spent - budget)}
            </p>
          ) : tone === "warn" ? (
            <p className="budget-msg text-warn">
              <AlertTriangle size={15} /> {percent.toFixed(0)}% used - slow down!
            </p>
          ) : (
            <p className="budget-msg muted">{formatMoney(budget - spent)} left this month</p>
          )}
        </>
      ) : (
        <p className="muted">Set a monthly limit and get a warning before you overspend.</p>
      )}
    </div>
  );
}
