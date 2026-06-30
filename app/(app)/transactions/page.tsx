"use client";
import { useState } from "react";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useCategories } from "@/lib/hooks/useCategories";
import type { TransactionFilters } from "@/lib/types";
import TransactionList from "@/components/transactions/TransactionList";
import TransactionFiltersBar from "@/components/transactions/TransactionFilters";
import TransactionForm from "@/components/transactions/TransactionForm";
import SheetsExport from "@/components/sheets/SheetsExport";
import PageHeader from "@/components/shared/PageHeader";
import { RowsSkeleton } from "@/components/shared/Skeletons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Download, FileSpreadsheet, FileText } from "lucide-react";
import { getCurrentMonthRange } from "@/lib/utils/date-helpers";

export default function TransactionsPage() {
  const { from, to } = getCurrentMonthRange();
  const [filters, setFilters] = useState<TransactionFilters>({ date_from: from, date_to: to });
  const [newTxOpen, setNewTxOpen] = useState(false);
  const [sheetsOpen, setSheetsOpen] = useState(false);
  const { transactions, loading, refetch } = useTransactions(filters);
  const { categories } = useCategories();

  function handleExportCSV() {
    const params = new URLSearchParams();
    if (filters.date_from) params.set("date_from", filters.date_from);
    if (filters.date_to) params.set("date_to", filters.date_to);
    window.open(`/api/export/csv?${params}`, "_blank");
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Transacciones"
        action={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="icon" aria-label="Exportar">
                    <Download className="h-4 w-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSheetsOpen(true)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
                  Google Sheets
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileText className="mr-2 h-4 w-4" />
                  Descargar CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={newTxOpen} onOpenChange={setNewTxOpen}>
              <SheetTrigger
                render={
                  <Button size="icon" aria-label="Nueva transacción">
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              />
              <SheetContent
                side="right"
                className="h-full w-full overflow-y-auto md:w-[clamp(480px,40vw,860px)] md:max-w-none"
              >
                <SheetHeader className="border-b border-border">
                  <SheetTitle>Nueva transacción</SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-6">
                  <TransactionForm
                    categories={categories}
                    onSuccess={() => { setNewTxOpen(false); refetch(); }}
                    onCancel={() => setNewTxOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </>
        }
      />

      <TransactionFiltersBar filters={filters} categories={categories} onChange={setFilters} />

      {loading ? (
        <RowsSkeleton />
      ) : (
        <TransactionList transactions={transactions} categories={categories} onRefetch={refetch} />
      )}

      <SheetsExport open={sheetsOpen} onClose={() => setSheetsOpen(false)} filters={filters} />
    </div>
  );
}
