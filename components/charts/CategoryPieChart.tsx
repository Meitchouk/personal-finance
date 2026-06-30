"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { usePreferences } from "@/components/providers/PreferencesProvider";
import type { CategorySpending } from "@/lib/types";

export default function CategoryPieChart({ data }: { data: CategorySpending[] }) {
  const { formatMoney } = usePreferences();

  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Sin datos para mostrar
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.category.name,
    value: d.total,
    color: d.category.color,
  }));

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={200} className="max-w-[240px]">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatMoney(Number(value))}
            contentStyle={{
              borderRadius: "0.5rem",
              border: "1px solid var(--border)",
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <ul className="grid w-full grid-cols-1 gap-1.5 sm:max-w-[180px]">
        {data.slice(0, 6).map((d) => (
          <li key={d.category.id} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.category.color }} />
            <span className="flex-1 truncate text-muted-foreground">{d.category.name}</span>
            <span className="font-medium tabular-nums">{d.percentage.toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
