import Link from "next/link";
import { getPreferences, getTransactionsBetween } from "@/lib/supabase/queries";
import { getCurrentMonthRange } from "@/lib/utils/date-helpers";
import { summarize, spendingByCategory } from "@/lib/utils/aggregations";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import TransactionRow from "@/components/transactions/TransactionRow";
import EmptyState from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Receipt } from "lucide-react";

export default async function DashboardPage() {
  const { from, to } = getCurrentMonthRange();
  const [{ currency }, transactions] = await Promise.all([
    getPreferences(),
    getTransactionsBetween(from, to),
  ]);

  const { income, expenses, net } = summarize(transactions);
  const byCategory = spendingByCategory(transactions);
  const recent = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle={formatMonthYear()} />

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Ingresos" value={formatCurrency(income, currency)} icon={TrendingUp} tone="income" />
        <StatCard label="Gastos" value={formatCurrency(expenses, currency)} icon={TrendingDown} tone="expense" />
        <StatCard
          label="Balance"
          value={formatCurrency(net, currency)}
          icon={Wallet}
          tone={net >= 0 ? "income" : "expense"}
        />
      </div>

      {byCategory.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Gastos por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={byCategory} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recientes</CardTitle>
          {transactions.length > 0 && (
            <Link href="/transactions" className="text-xs font-medium text-primary">
              Ver todo
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Sin movimientos este mes"
              description="Agrega tu primer ingreso o gasto para empezar."
            />
          ) : (
            <div className="space-y-3">
              {recent.map((t) => (
                <TransactionRow key={t.id} transaction={t} compact />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
