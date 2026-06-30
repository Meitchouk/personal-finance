import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import MonthlyTrendChart from "@/components/charts/MonthlyTrendChart";
import { Transaction, CategorySpending, MonthlyTrend, Category } from "@/lib/types";
import { getLastNMonths, formatCurrency } from "@/lib/utils/date-helpers";
import { format } from "date-fns";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const months = getLastNMonths(6);
  const dateFrom = months[0].from;
  const dateTo = months[months.length - 1].to;

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, categories(*)")
    .eq("user_id", user!.id)
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .order("date", { ascending: false });

  const txs = (transactions as Transaction[]) ?? [];

  // Monthly trend
  const monthlyTrend: MonthlyTrend[] = months.map((m) => {
    const monthTxs = txs.filter((t) => t.date >= m.from && t.date <= m.to);
    return {
      month: format(new Date(m.from + "T00:00:00"), "MMM"),
      income: monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expenses: monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  });

  // Category spending (all 6 months)
  const totalExpenses = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const categoryMap = new Map<string, { category: Category; total: number }>();
  txs.filter((t) => t.type === "expense" && t.categories).forEach((t) => {
    const key = t.category_id!;
    if (!categoryMap.has(key)) categoryMap.set(key, { category: t.categories!, total: 0 });
    categoryMap.get(key)!.total += t.amount;
  });
  const categorySpending: CategorySpending[] = Array.from(categoryMap.values())
    .map((e) => ({ ...e, percentage: totalExpenses > 0 ? (e.total / totalExpenses) * 100 : 0 }))
    .sort((a, b) => b.total - a.total);

  const totalIncome = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-muted-foreground text-sm">Últimos 6 meses</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total ingresos</p>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total gastos</p>
            <p className="text-lg font-bold text-rose-500">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Trend chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ingresos vs Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyTrendChart data={monthlyTrend} />
        </CardContent>
      </Card>

      {/* Pie chart */}
      {categorySpending.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Gastos por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categorySpending} />
          </CardContent>
        </Card>
      )}

      {/* Top categories list */}
      {categorySpending.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top categorías</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categorySpending.slice(0, 5).map((cs, i) => (
              <div key={cs.category.id} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-4">{i + 1}</span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: `${cs.category.color}22` }}
                >
                  {cs.category.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{cs.category.name}</span>
                    <span>{formatCurrency(cs.total)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cs.percentage}%`, backgroundColor: cs.category.color }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {cs.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
