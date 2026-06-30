"use client";
import { useState } from "react";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useCategories } from "@/lib/hooks/useCategories";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useTemplates } from "@/lib/hooks/useTemplates";
import type { TransactionFilters, TransactionTemplate } from "@/lib/types";
import TransactionList from "@/components/transactions/TransactionList";
import TransactionFiltersBar from "@/components/transactions/TransactionFilters";
import TransactionForm, { type TransactionDefaults } from "@/components/transactions/TransactionForm";
import QuickAccess from "@/components/transactions/QuickAccess";
import SheetsExport from "@/components/sheets/SheetsExport";
import PageHeader from "@/components/shared/PageHeader";
import AppSheet from "@/components/shared/AppSheet";
import { RowsSkeleton } from "@/components/shared/Skeletons";
import { Button } from "@/components/ui/button";
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
  const [formDefaults, setFormDefaults] = useState<TransactionDefaults | undefined>();

  const { transactions, loading, refetch } = useTransactions(filters);
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { templates, deleteTemplate, refetch: refetchTemplates } = useTemplates();

  function handleExportCSV() {
    const params = new URLSearchParams();
    if (filters.date_from) params.set("date_from", filters.date_from);
    if (filters.date_to) params.set("date_to", filters.date_to);
    window.open(`/api/export/csv?${params}`, "_blank");
  }

  function openFromTemplate(template: TransactionTemplate) {
    setFormDefaults({
      type: template.type,
      description: template.description,
      original_amount: template.original_amount,
      original_currency: template.original_currency,
      category_id: template.category_id ?? undefined,
      account_id: template.account_id ?? undefined,
    });
    setNewTxOpen(true);
  }

  function handleNewTxOpenChange(open: boolean) {
    setNewTxOpen(open);
    if (!open) setFormDefaults(undefined);
  }

  function handleTxSuccess() {
    setNewTxOpen(false);
    setFormDefaults(undefined);
    refetch();
    refetchTemplates();
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

            <Button size="icon" aria-label="Nueva transacción" onClick={() => setNewTxOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <QuickAccess
        templates={templates}
        onUse={openFromTemplate}
        onDelete={deleteTemplate}
      />

      <TransactionFiltersBar filters={filters} categories={categories} onChange={setFilters} />

      {loading ? (
        <RowsSkeleton />
      ) : (
        <TransactionList transactions={transactions} categories={categories} accounts={accounts} onRefetch={refetch} />
      )}

      <SheetsExport open={sheetsOpen} onClose={() => setSheetsOpen(false)} filters={filters} />

      <AppSheet open={newTxOpen} onOpenChange={handleNewTxOpenChange} title="Nueva transacción" size="wide">
        <TransactionForm
          categories={categories}
          accounts={accounts}
          defaultValues={formDefaults}
          onSuccess={handleTxSuccess}
          onCancel={() => handleNewTxOpenChange(false)}
        />
      </AppSheet>
    </div>
  );
}
