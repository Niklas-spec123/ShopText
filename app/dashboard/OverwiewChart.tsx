"use client";

import {
  LineChart,
  XAxis,
  YAxis,
  Line,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function OverviewChart({ history }: { history: any[] }) {
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const data = days.map((day) => ({
    date: day.toLocaleDateString("sv-SE", { weekday: "short" }),
    count: history.filter(
      (h) => new Date(h.created_at).toDateString() === day.toDateString()
    ).length,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="date" stroke="#64748b" />
        <YAxis stroke="#64748b" allowDecimals={false} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#6366f1"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
