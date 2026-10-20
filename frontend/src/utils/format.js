// Formatting + calculation helpers (money, dates, chart data).

// 12345.5 -> "₹12,345.50"
const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});
export const formatMoney = (value) => inr.format(Number(value) || 0);

// Short version for chart axes, Indian style: 12500 -> "₹12.5k", 250000 -> "₹2.5L", 20000000 -> "₹2Cr"
// (Intl "compact" would print "T" for thousand in en-IN, so it is done by hand.)
export const formatCompact = (value) => {
  const n = Number(value) || 0;
  const trim = (x) => String(Math.round(x * 10) / 10);
  if (n >= 1e7) return `₹${trim(n / 1e7)}Cr`;
  if (n >= 1e5) return `₹${trim(n / 1e5)}L`;
  if (n >= 1e3) return `₹${trim(n / 1e3)}k`;
  return `₹${trim(n)}`;
};

// "2026-10-20" -> "20 Oct 2026". Built from parts to avoid timezone shifts.
export const formatDate = (dateStr) => {
  const [y, m, d] = String(dateStr).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// "2026-10-20" -> "2026-10" (used to group by month)
export const monthKey = (dateStr) => String(dateStr).slice(0, 7);

// Current month as "YYYY-MM"
export const currentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

// Today as "YYYY-MM-DD" for <input type="date">
export const todayString = () => {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mm}-${dd}`;
};

// "2026-10" -> "October 2026"
export const monthLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

const sum = (list) => list.reduce((total, e) => total + Number(e.amount || 0), 0);

// Numbers for the 4 stat cards
export function computeStats(expenses) {
  const nowKey = currentMonthKey();
  const [y, m] = nowKey.split("-").map(Number);
  const prev = new Date(y, m - 2, 1);
  const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;

  const thisMonthList = expenses.filter((e) => monthKey(e.date) === nowKey);
  const lastMonthList = expenses.filter((e) => monthKey(e.date) === prevKey);

  const thisMonth = sum(thisMonthList);
  const lastMonth = sum(lastMonthList);

  // % change vs last month (null when there is nothing to compare with)
  const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null;

  // Biggest category this month (falls back to all time)
  const top = byCategory(thisMonthList.length ? thisMonthList : expenses)[0] || null;

  return { total: sum(expenses), thisMonth, lastMonth, change, count: expenses.length, top };
}

// [{ name: "Food", value: 1200 }, ...] biggest first (for the donut chart)
export function byCategory(expenses) {
  const totals = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + Number(e.amount || 0);
  });
  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// Total per month for the last `n` months (for the bar chart)
export function monthlyTrend(expenses, n = 6) {
  const now = new Date();
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({ key, label: d.toLocaleDateString("en-IN", { month: "short" }), total: 0 });
  }
  expenses.forEach((e) => {
    const slot = months.find((x) => x.key === monthKey(e.date));
    if (slot) slot.total += Number(e.amount || 0);
  });
  return months;
}
