// Two charts built with Recharts:
//  - Donut: spending by category (follows the active filters)
//  - Bar:   total per month for the last 6 months
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { CATEGORY_META } from "../utils/categories.js";
import { formatMoney, formatCompact } from "../utils/format.js";

// Tooltip look (uses theme colours so it works in dark mode too)
const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  color: "var(--text)",
  boxShadow: "var(--shadow)",
};

export function CategoryChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="card">
      <div className="card-head"><h3>Spending by category</h3></div>

      {data.length === 0 ? (
        <p className="muted empty-chart">No data to show yet.</p>
      ) : (
        <div className="donut-wrap">
          <div className="donut">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={3} stroke="none">
                  {data.map((d) => (
                    <Cell key={d.name} fill={CATEGORY_META[d.name]?.color || "#64748b"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatMoney(v)} contentStyle={tooltipStyle} itemStyle={{ color: "var(--text)" }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Total shown in the hole of the donut */}
            <div className="donut-center">
              <small className="muted">Total</small>
              <strong>{formatCompact(total)}</strong>
            </div>
          </div>

          {/* Legend */}
          <ul className="legend">
            {data.map((d) => (
              <li key={d.name}>
                <span className="dot" style={{ background: CATEGORY_META[d.name]?.color }} />
                <span>{d.name}</span>
                <strong>{((d.value / total) * 100).toFixed(0)}%</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function TrendChart({ data }) {
  return (
    <div className="card">
      <div className="card-head"><h3>Last 6 months</h3></div>
      <div className="bar-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} tickFormatter={formatCompact} width={56} />
            <Tooltip formatter={(v) => formatMoney(v)} cursor={{ fill: "var(--surface-2)" }} contentStyle={tooltipStyle} itemStyle={{ color: "var(--text)" }} />
            <Bar dataKey="total" name="Spent" fill="url(#barGrad)" radius={[8, 8, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
