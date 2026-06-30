"use client";
import { useState } from "react";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useCategories } from "@/lib/hooks/useCategories";
import { TransactionFilters } from "@/lib/types";
import TransactionList from "@/components/transactions/TransactionList";
import TransactionFiltersBar from "@/components/transactions/TransactionFilters";
import TransactionForm from "@/components/transactions/TransactionForm";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Download } from "lucide-react";
import { getCurrentMonthRange } from "@/lib/utils/date-helpers";

export default function TransactionsPage() {
  const { from, to } = getCurrentMonthRange();
  const [filters, setFilters] = useState<TransactionFilters>({ date_from: from, date_to: to });
  const [sheetOpen, setSheetOpen] = useState(false);
  const { transactions, loading, refetch } = useTransactions(filters);
  const { categories } = useCategories();

  function handleExport() {
    const params = new URLSearchParams();
    if (filters.date_from) params.set("date_from", filters.date_from);
    if (filters.date_to) params.set("date_to", filters.date_to);
    window.open(`/api/export/csv?${params}`, "_blank");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger render={<Button className="bg-emerald-500 hover:bg-emerald-600" size="icon"><Plus className="h-4 w-4" /></Button>} />
            <SheetContent side="bottom" className="h-auto max-h-[90vh] overflow-y-auto rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Nueva transacción</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <TransactionForm
                  categories={categories}
                  onSuccess={() => { setSheetOpen(false); refetch(); }}
                  onCancel={() => setSheetOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <TransactionFiltersBar filters={filters} categories={categories} onChange={setFilters} />

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <TransactionList transactions={transactions} categories={categories} onRefetch={refetch} />
      )}
    </div>
  );
}
