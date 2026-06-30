"use client";
import { useState } from "react";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useCategories } from "@/lib/hooks/useCategories";
import { TransactionFilters } from "@/lib/types";
import TransactionList from "@/components/transactions/TransactionList";
import TransactionFiltersBar from "@/components/transactions/TransactionFilters";
import TransactionForm from "@/components/transactions/TransactionForm";
import SheetsExport from "@/components/sheets/SheetsExport";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <div className="flex gap-2">
          {/* Export menu */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" size="icon" aria-label="Exportar">
                <Download className="h-4 w-4" />
              </Button>
            } />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSheetsOpen(true)}>
                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                Google Sheets
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileText className="h-4 w-4 mr-2" />
                Descargar CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* New transaction */}
          <Sheet open={newTxOpen} onOpenChange={setNewTxOpen}>
            <SheetTrigger render={
              <Button className="bg-emerald-500 hover:bg-emerald-600" size="icon" aria-label="Nueva transacción">
                <Plus className="h-4 w-4" />
              </Button>
            } />
            <SheetContent side="bottom" className="h-auto max-h-[90vh] overflow-y-auto rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Nueva transacción</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <TransactionForm
                  categories={categories}
                  onSuccess={() => { setNewTxOpen(false); refetch(); }}
                  onCancel={() => setNewTxOpen(false)}
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

      <SheetsExport open={sheetsOpen} onClose={() => setSheetsOpen(false)} filters={filters} />
    </div>
  );
}
