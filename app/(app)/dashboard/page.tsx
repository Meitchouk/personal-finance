import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import { formatCurrency, getCurrentMonthRange } from "@/lib/utils/date-helpers";
import { Transaction, CategorySpending, Category } from "@/lib/types";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date-helpers";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { from, to } = getCurrentMonthRange();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, categories(*)")
    .eq("user_id", user!.id)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: false });

  const txs = (transactions as Transaction[]) ?? [];
  const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expenses;

  // Category spending breakdown
  const categoryMap = new Map<string, { category: Category; total: number }>();
  txs.filter((t) => t.type === "expense" && t.categories).forEach((t) => {
    const key = t.category_id!;
    if (!categoryMap.has(key)) categoryMap.set(key, { category: t.categories!, total: 0 });
    categoryMap.get(key)!.total += t.amount;
  });
  const categorySpending: CategorySpending[] = Array.from(categoryMap.values())
    .map((e) => ({ ...e, percentage: expenses > 0 ? (e.total / expenses) * 100 : 0 }))
    .sort((a, b) => b.total - a.total);

  const recent = txs.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Este mes</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs text-emerald-700">Ingresos</span>
            </div>
            <p className="font-bold text-sm text-emerald-700">{formatCurrency(income)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-rose-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-1 mb-1">
              <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
              <span className="text-xs text-rose-700">Gastos</span>
            </div>
            <p className="font-bold text-sm text-rose-700">{formatCurrency(expenses)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-1 mb-1">
              <Wallet className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs text-blue-700">Neto</span>
            </div>
            <p className={`font-bold text-sm ${net >= 0 ? "text-blue-700" : "text-rose-600"}`}>
              {formatCurrency(net)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pie chart */}
      {categorySpending.length > 0 && (
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Gastos por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categorySpending} />
          </CardContent>
        </Card>
      )}

      {/* Recent transactions */}
      <Card className="shadow-sm border-0">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recientes</CardTitle>
          <Link href="/transactions" className="text-xs text-emerald-600">Ver todo</Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Sin transacciones este mes
            </p>
          ) : recent.map((t) => (
            <div key={t.id} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                style={{ backgroundColor: t.categories?.color ? `${t.categories.color}22` : "#f3f4f6" }}
              >
                {t.categories?.emoji ?? "💳"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.description}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                  {t.categories && (
                    <Badge variant="outline" className="text-xs py-0 h-4" style={{ borderColor: t.categories.color, color: t.categories.color }}>
                      {t.categories.name}
                    </Badge>
                  )}
                </div>
              </div>
              <span className={`font-semibold text-sm ${t.type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
                {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
