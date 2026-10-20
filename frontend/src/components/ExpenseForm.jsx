// Add / edit expense form (shown inside a Modal).
// Leaving the category on "Auto" lets the backend ask Gemini to pick one.
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { CATEGORIES } from "../utils/categories.js";
import { todayString } from "../utils/format.js";

export default function ExpenseForm({ expense, defaultName, onSave, onCancel }) {
  const isEdit = Boolean(expense);

  const [form, setForm] = useState({
    title: expense?.title || "",
    amount: expense?.amount || "",
    category: expense?.category || "", // "" = Auto (AI)
    date: expense?.date || todayString(),
    name: expense?.name || defaultName,
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, title: form.title.trim(), name: form.name.trim() }, expense?.id);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <label className="field">
        <span>Title</span>
        <input type="text" placeholder="e.g. Dinner at Pizza Hut" value={form.title} onChange={set("title")} required autoFocus />
      </label>

      <div className="form-grid">
        <label className="field">
          <span>Amount (₹)</span>
          <input type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={set("amount")} required />
        </label>

        <label className="field">
          <span>Date</span>
          <input type="date" value={form.date} onChange={set("date")} required />
        </label>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Category</span>
          <select value={form.category} onChange={set("category")}>
            {/* "Auto" only makes sense when adding */}
            {!isEdit && <option value="">Auto (AI picks)</option>}
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Spent by</span>
          <input type="text" value={form.name} onChange={set("name")} required />
        </label>
      </div>

      {!isEdit && !form.category && (
        <p className="hint"><Sparkles size={14} /> Gemini AI will choose the category from your title.</p>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? <Loader2 size={18} className="spin" /> : isEdit ? "Update expense" : "Add expense"}
        </button>
      </div>
    </form>
  );
}
