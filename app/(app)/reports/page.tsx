import { getPreferences, getTransactionsBetween } from "@/lib/supabase/queries";
import { getLastNMonths } from "@/lib/utils/date-helpers";
import { summarize, spendingByCategory, monthlyTrend } from "@/lib/utils/aggregations";
import { formatCurrency } from "@/lib/format";
import { TREND_MONTHS } from "@/lib/constants";
import PageHeader from "@/components/shared/PageHeader";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import MonthlyTrendChart from "@/components/charts/MonthlyTrendChart";
import CategoryIcon from "@/components/shared/CategoryIcon";
import EmptyState from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieIcon } from "lucide-react";

export default async function ReportsPage() {
  const buckets = getLastNMonths(TREND_MONTHS);
  const from = buckets[0].from;
  const to = buckets[buckets.length - 1].to;

  const [{ currency }, transactions] = await Promise.all([
    getPreferences(),
    getTransactionsBetween(from, to),
  ]);

  const { income, expenses } = summarize(transactions);
  const byCategory = spendingByCategory(transactions);
  const trend = monthlyTrend(transactions, buckets);
  const hasData = transactions.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Reportes" subtitle={`Últimos ${TREND_MONTHS} meses`} />

      {!hasData ? (
        <EmptyState
          icon={PieIcon}
          title="Aún no hay datos"
          description="Registra transacciones para ver tus reportes."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <p className="mb-1 text-xs text-muted-foreground">Total ingresos</p>
                <p className="text-lg font-bold tabular-nums text-income">{formatCurrency(income, currency)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="mb-1 text-xs text-muted-foreground">Total gastos</p>
                <p className="text-lg font-bold tabular-nums text-expense">{formatCurrency(expenses, currency)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ingresos vs Gastos</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyTrendChart data={trend} />
            </CardContent>
          </Card>

          {byCategory.length > 0 && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Gastos por categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryPieChart data={byCategory} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Top categorías</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {byCategory.slice(0, 5).map((cs) => (
                    <div key={cs.category.id} className="flex items-center gap-3">
                      <CategoryIcon category={cs.category} size="sm" />
                      <div className="flex-1">
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-medium">{cs.category.name}</span>
                          <span className="tabular-nums">{formatCurrency(cs.total, currency)}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${cs.percentage}%`, backgroundColor: cs.category.color }}
                          />
                        </div>
                      </div>
                      <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
                        {cs.percentage.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
