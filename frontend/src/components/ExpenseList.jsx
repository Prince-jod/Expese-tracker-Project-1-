// Expense table with search, category / month filters, sorting and export.
// On phones the table turns into stacked cards (pure CSS, see index.css).
import { useEffect, useState } from "react";
import { Search, Pencil, Trash2, Download, FileText, FileSpreadsheet, Plus, Inbox, Crown } from "lucide-react";
import { CATEGORIES, CATEGORY_META } from "../utils/categories.js";
import { formatMoney, formatDate, monthLabel } from "../utils/format.js";

const DEFAULT_PAGE_SIZE = 10;

const PAGE_SIZE_OPTIONS = [5, 8, 10, 20, 30, 40];

const getSavedPageSize = () => {
  try {
    const saved = Number(localStorage.getItem("expensePageSize"));

    return PAGE_SIZE_OPTIONS.includes(saved)
      ? saved
      : DEFAULT_PAGE_SIZE;
  } catch {
    return DEFAULT_PAGE_SIZE;
  }
};

export default function ExpenseList({
  expenses, // already filtered + sorted by the Dashboard
  allExpenses,
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
  const [pageSize, setPageSize] = useState(getSavedPageSize);
const [currentPage, setCurrentPage] = useState(1);
const [exportOpen, setExportOpen] = useState(false);

  const update = (patch) => {
  setFilters((previous) => ({ ...previous, ...patch }));
  setCurrentPage(1);
};

  const totalPages = Math.ceil(expenses.length / pageSize);
useEffect(() => {
  const safeTotalPages = Math.ceil(expenses.length / pageSize);

  if (safeTotalPages === 0) {
    setCurrentPage(1);
  } else if (currentPage > safeTotalPages) {
    setCurrentPage(safeTotalPages);
  }
}, [currentPage, expenses.length, pageSize]);
const startIndex = (currentPage - 1) * pageSize;

const paginatedExpenses = expenses.slice(
  startIndex,
  startIndex + pageSize
);

const handlePageSizeChange = (e) => {
  const newSize = Number(e.target.value);

  if (!PAGE_SIZE_OPTIONS.includes(newSize)) return;

  setPageSize(newSize);
  setCurrentPage(1);

  try {
    localStorage.setItem("expensePageSize", String(newSize));
  } catch {
    // Continue working even if localStorage is unavailable.
  }
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
    {[...new Set(allExpenses.map((e) => new Date(e.date).getFullYear()))]
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
              {paginatedExpenses.map((e) => {
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
          <div className="pagination-controls">
  <label htmlFor="pageSize">Expenses per page:</label>

  <select
    id="pageSize"
    value={pageSize}
    onChange={handlePageSizeChange}
  >
    {PAGE_SIZE_OPTIONS.map((size) => (
      <option key={size} value={size}>
        {size}
      </option>
    ))}
  </select>

  <span>
    {expenses.length === 0
      ? "Showing 0 expenses"
      : `Showing ${startIndex + 1}–${Math.min(
          startIndex + pageSize,
          expenses.length
        )} of ${expenses.length}`}
  </span>
</div>
{totalPages > 1 && (
  <div className="pagination-buttons">
    <button
      className="btn btn-ghost"
      disabled={currentPage === 1}
      onClick={() =>
        setCurrentPage((page) => Math.max(1, page - 1))
      }
    >
      Previous
    </button>

    <span>
      Page {currentPage} of {totalPages}
    </span>

    <button
      className="btn btn-ghost"
      disabled={currentPage === totalPages}
      onClick={() =>
        setCurrentPage((page) => Math.min(totalPages, page + 1))
      }
    >
      Next
    </button>
  </div>
)}

          
        </>
      )}
    </div>
  );
}
