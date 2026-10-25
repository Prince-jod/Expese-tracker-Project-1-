// Expense table with search, category / month filters, sorting and export.
// On phones the table turns into stacked cards (pure CSS, see index.css).
import { useState } from "react";
import { Search, Pencil, Trash2, Download, FileText, FileSpreadsheet, Plus, Inbox, Crown } from "lucide-react";
import { CATEGORIES, CATEGORY_META } from "../utils/categories.js";
import { formatMoney, formatDate, monthLabel } from "../utils/format.js";

const PAGE_SIZE = 5;

export default function ExpenseList({
  expenses, // already filtered + sorted by the Dashboard
  filters,
  setFilters,
  months,   
  loading,
  isPrime,
  hasAny, // are there any expenses at all (before filtering)?
  onAdd,
  onEdit,
  onDelete,
  onExport,
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [exportOpen, setExportOpen] = useState(false);

  const update = (patch) => {
    setFilters({ ...filters, ...patch });
    setVisible(PAGE_SIZE); // go back to the first page when filters change
  };

  return (
    <div className="card">
      <div className="card-head wrap">
        <h3>Transactions</h3>

        <div className="list-actions">
          {/* Export dropdown (premium) */}
          <div className="dropdown">
            <button className="btn btn-ghost btn-sm" onClick={() => setExportOpen((o) => !o)}>
              <Download size={16} /> Export {!isPrime && <Crown size={13} className="text-gold" />}
            </button>
            {exportOpen && (
              <div className="dropdown-menu" onMouseLeave={() => setExportOpen(false)}>
                <button onClick={() => { setExportOpen(false); onExport("pdf"); }}>
                  <FileText size={16} /> PDF report
                </button>
                <button onClick={() => { setExportOpen(false); onExport("csv"); }}>
                  <FileSpreadsheet size={16} /> CSV file
                </button>
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-sm" onClick={onAdd}>
            <Plus size={16} /> Add expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="input-group search">
          <Search size={17} className="input-icon" />
          <input
            type="search"
            placeholder="Search title or name..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
          />
        </div>

        <select value={filters.category} onChange={(e) => update({ category: e.target.value })} aria-label="Filter by category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Period filter */}
<select
  value={filters.period}
  onChange={(e) =>
    update({
      period: e.target.value,
      weekDate: "",
      month: "",
      year: "",
    })
  }
  aria-label="Filter by period"
>
  <option value="week">Week</option>
  <option value="month">Month</option>
  <option value="year">Year</option>
</select>

{/* Week filter */}
{filters.period === "week" && (
  <input
    type="date"
    value={filters.weekDate}
    onChange={(e) => update({ weekDate: e.target.value })}
    aria-label="Select a date within the week"
  />
)}

{/* Month filter */}
{filters.period === "month" && (
  <select
    value={filters.month}
    onChange={(e) => update({ month: e.target.value })}
    aria-label="Filter by month"
  >
    <option value="">All months</option>
    {months.map((m) => (
      <option key={m} value={m}>
        {monthLabel(m)}
      </option>
    ))}
  </select>
)}

{/* Year filter */}
{filters.period === "year" && (
  <select
    value={filters.year}
    onChange={(e) => update({ year: e.target.value })}
    aria-label="Filter by year"
  >
    <option value="">All years</option>
    {[...new Set(expenses.map((e) => new Date(e.date).getFullYear()))]
      .sort((a, b) => b - a)
      .map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
  </select>
)}

        <select value={filters.sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort">
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Highest amount</option>
          <option value="amount-asc">Lowest amount</option>
        </select>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="skeleton-list">
          {[1, 2, 3, 4].map((n) => <div key={n} className="skeleton" style={{ height: 52 }} />)}
        </div>
      )}

      {/* Empty states */}
      {!loading && expenses.length === 0 && (
        <div className="empty">
          <span className="state-icon"><Inbox size={30} /></span>
          <h4>{hasAny ? "No expenses match your filters" : "No expenses yet"}</h4>
          <p className="muted">
            {hasAny ? "Try a different search or clear the filters." : "Add your first expense to see charts and insights."}
          </p>
          {!hasAny && (
            <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> Add expense</button>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && expenses.length > 0 && (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Expense</th>
                <th>Category</th>
                <th>Date</th>
                <th>Spent by</th>
                <th className="right">Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {expenses.slice(0, visible).map((e) => {
                const meta = CATEGORY_META[e.category] || CATEGORY_META.Other;
                const Icon = meta.icon;
                return (
                  <tr key={e.id}>
                    <td data-label="Expense" className="cell-title">
                      <span className="cat-icon" style={{ background: `${meta.color}22`, color: meta.color }}>
                        <Icon size={18} />
                      </span>
                      <strong>{e.title}</strong>
                    </td>
                    <td data-label="Category">
                      <span className="pill" style={{ background: `${meta.color}1f`, color: meta.color }}>
                        {e.category}
                      </span>
                    </td>
                    <td data-label="Date">{formatDate(e.date)}</td>
                    <td data-label="Spent by">{e.name}</td>
                    <td data-label="Amount" className="right amount">{formatMoney(e.amount)}</td>
                    <td className="row-actions">
                      <button className="icon-btn" onClick={() => onEdit(e)} aria-label="Edit"><Pencil size={16} /></button>
                      <button className="icon-btn danger" onClick={() => onDelete(e)} aria-label="Delete"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {expenses.length > visible && (
            <button className="btn btn-ghost btn-block" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
              Show more ({expenses.length - visible} left)
            </button>
          )}
        </>
      )}
    </div>
  );
}
