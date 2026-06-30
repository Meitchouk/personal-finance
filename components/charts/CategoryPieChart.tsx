"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CategorySpending } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/date-helpers";

interface Props {
  data: CategorySpending[];
}

export default function CategoryPieChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Sin datos para mostrar
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: `${d.category.emoji} ${d.category.name}`,
    value: d.total,
    color: d.category.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          outerRadius={90}
          dataKey="value"
          label={({ percent }) => percent != null ? `${(percent * 100).toFixed(0)}%` : ""}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Legend
          formatter={(value) => <span className="text-xs">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
