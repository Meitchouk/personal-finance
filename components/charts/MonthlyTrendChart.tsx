"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { usePreferences } from "@/components/providers/PreferencesProvider";
import { INCOME_COLOR, EXPENSE_COLOR } from "@/lib/constants";
import type { MonthlyTrend } from "@/lib/types";

export default function MonthlyTrendChart({ data }: { data: MonthlyTrend[] }) {
  const { formatMoney } = usePreferences();

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          formatter={(value) => formatMoney(Number(value))}
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
          contentStyle={{
            borderRadius: "0.5rem",
            border: "1px solid var(--border)",
            background: "var(--popover)",
            color: "var(--popover-foreground)",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" name="Ingresos" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Gastos" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
