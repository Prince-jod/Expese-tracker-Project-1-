// Main page after login. Holds all the data and wires the components together.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { load } from "@cashfreepayments/cashfree-js";
import api, { getErrorMessage } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Navbar from "../components/Navbar.jsx";
import StatCards from "../components/StatCards.jsx";
import BudgetCard from "../components/BudgetCard.jsx";
import { CategoryChart, TrendChart } from "../components/Charts.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import ExpenseForm from "../components/ExpenseForm.jsx";
import Leaderboard from "../components/Leaderboard.jsx";
import PremiumBanner from "../components/PremiumBanner.jsx";
import Modal from "../components/Modal.jsx";
import { computeStats, byCategory, monthlyTrend, monthKey } from "../utils/format.js";
import { exportPdf, exportCsv } from "../utils/export.js";
import { Loader2 } from "lucide-react";

// "Good morning / afternoon / evening"
const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  // ---------- State ----------
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
const [filters, setFilters] = useState({
  search: "",
  category: "",
  period: "month",
  weekDate: "",
  month: "",
  year: "",
  sort: "date-desc",
});  const [formState, setFormState] = useState({ open: false, expense: null }); // add/edit modal
  const [toDelete, setToDelete] = useState(null); // expense waiting for delete confirmation
  const [deleting, setDeleting] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  // ---------- Load data ----------
  const loadExpenses = useCallback(async () => {
    try {
      const { data } = await api.get("/expenses");
      setExpenses(data.expenses || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not load expenses."));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Premium users also get the leaderboard (reloads when expenses change)
  useEffect(() => {
    if (!user.isPrime) return;
    api
      .get("/leaderboard")
      .then(({ data }) => setLeaderboard(data.leaderboard || []))
      .catch(() => setLeaderboard([]));
  }, [user.isPrime, expenses]);

  // ---------- Derived data (recomputed only when expenses/filters change) ----------
  const stats = useMemo(() => computeStats(expenses), [expenses]);
  const trend = useMemo(() => monthlyTrend(expenses, 6), [expenses]);

  // Months that actually have expenses (for the month filter)
  const months = useMemo(
    () => [...new Set(expenses.map((e) => monthKey(e.date)))].sort().reverse(),
    [expenses]
  );

  // Apply search + category + month filters, then sort
  // Apply search + category + period filters, then sort
const filtered = useMemo(() => {
  const q = filters.search.trim().toLowerCase();

  const list = expenses.filter((e) => {
    const expenseDate = new Date(e.date);
    const matchesSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.name.toLowerCase().includes(q);

    const matchesCategory =
      !filters.category || e.category === filters.category;

    let matchesPeriod = true;

    if (filters.period === "week" && filters.weekDate) {
      const selectedDate = new Date(`${filters.weekDate}T12:00:00`);

      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      matchesPeriod =
        expenseDate >= startOfWeek && expenseDate < endOfWeek;
    }

    if (filters.period === "month" && filters.month) {
      matchesPeriod = monthKey(e.date) === filters.month;
    }

    if (filters.period === "year" && filters.year) {
      matchesPeriod =
        expenseDate.getFullYear() === Number(filters.year);
    }

    return matchesSearch && matchesCategory && matchesPeriod;
  });

  const [field, dir] = filters.sort.split("-");

  list.sort((a, b) => {
    const diff =
      field === "amount"
        ? Number(a.amount) - Number(b.amount)
        : a.date.localeCompare(b.date);

    return dir === "asc" ? diff : -diff;
  });

  return list;
}, [expenses, filters]);

  const categoryData = useMemo(() => byCategory(filtered), [filtered]);

  // ---------- Actions ----------
  // Create or update (id present = update)
  const saveExpense = async (payload, id) => {
    try {
      if (id) await api.put(`/expenses/${id}`, payload);
      else await api.post("/expenses", payload);
      toast.success(id ? "Expense updated" : "Expense added");
      setFormState({ open: false, expense: null });
      await loadExpenses();
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to save expense."));
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/expenses/${toDelete.id}`);
      toast.success("Expense deleted");
      setToDelete(null);
      await loadExpenses();
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to delete expense."));
    } finally {
      setDeleting(false);
    }
  };

  // Export is a premium feature
  const handleExport = async (type) => {
    if (!user.isPrime) {
      toast.info("Export is a Premium feature. Upgrade to unlock it.");
      return;
    }
    if (filtered.length === 0) {
      toast.info("There are no expenses to export.");
      return;
    }
    try {
      if (type === "pdf") await exportPdf(filtered, user.name);
      else exportCsv(filtered);
    } catch {
      toast.error("Could not create the file. Please try again.");
    }
  };

  // Premium payment with Cashfree: create order -> checkout popup -> verify
  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const { data } = await api.post("/payment/create-order");

      const cashfree = await load({ mode: import.meta.env.VITE_CASHFREE_MODE || "sandbox" });
      await cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: "_modal" });

      // Ask our backend to confirm with Cashfree that the payment really went through
      const verify = await api.post("/payment/verify", { orderId: data.orderId });

      if (verify.data.status === "SUCCESSFUL") {
        updateUser({ isPrime: true });
        toast.success("Welcome to Premium!");
      } else if (verify.data.status === "FAILED") {
        toast.error("Payment failed. You have not been charged.");
      } else {
        toast.info("Payment was not completed.");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Something went wrong while starting the payment."));
    } finally {
      setUpgrading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="page">
      <Navbar onUpgrade={handleUpgrade} upgrading={upgrading} />

      <main className="container dashboard">
        {/* Greeting */}
        <div className="page-head">
          <div>
            <h1>{greeting()}, {user.name.split(" ")[0]}</h1>
            <p className="muted">{today}</p>
          </div>
          <button className="btn btn-primary hide-sm" onClick={() => setFormState({ open: true, expense: null })}>
            <Plus size={18} /> Add expense
          </button>
        </div>

        {!user.isPrime && <PremiumBanner onUpgrade={handleUpgrade} upgrading={upgrading} />}

        <StatCards stats={stats} loading={loading} />

        <div className="grid-main">
          <CategoryChart data={categoryData} />
          <div className="stack">
            <BudgetCard userId={user.id} spent={stats.thisMonth} />
            <TrendChart data={trend} />
          </div>
        </div>

        {user.isPrime && <Leaderboard items={leaderboard} />}

        <ExpenseList
          expenses={filtered}
          allExpenses={expenses}
          filters={filters}
          setFilters={setFilters}
          months={months}
          loading={loading}
          isPrime={user.isPrime}
          hasAny={expenses.length > 0}
          onAdd={() => setFormState({ open: true, expense: null })}
          onEdit={(expense) => setFormState({ open: true, expense })}
          onDelete={setToDelete}
          onExport={handleExport}
        />

        <footer className="footer">
          SpendWise &middot; Built with React, Node.js, Express, MySQL &amp; Gemini AI
        </footer>
      </main>

      {/* Floating add button on phones */}
      <button
        className="fab"
        onClick={() => setFormState({ open: true, expense: null })}
        aria-label="Add expense"
      >
        <Plus size={26} />
      </button>

      {/* Add / edit modal */}
      {formState.open && (
        <Modal
          title={formState.expense ? "Edit expense" : "Add expense"}
          onClose={() => setFormState({ open: false, expense: null })}
        >
          <ExpenseForm
            expense={formState.expense}
            defaultName={user.name}
            onSave={saveExpense}
            onCancel={() => setFormState({ open: false, expense: null })}
          />
        </Modal>
      )}

      {/* Delete confirmation */}
      {toDelete && (
        <Modal title="Delete expense?" onClose={() => setToDelete(null)}>
          <p className="muted confirm-text">
            "{toDelete.title}" will be permanently removed. This cannot be undone.
          </p>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? <Loader2 size={18} className="spin" /> : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
