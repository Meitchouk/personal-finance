"use client";
import { useState } from "react";
import type { Account, Transaction, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AppSheet from "@/components/shared/AppSheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, Receipt } from "lucide-react";
import TransactionForm from "./TransactionForm";
import TransactionRow from "./TransactionRow";
import EmptyState from "@/components/shared/EmptyState";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

interface Props {
  transactions: Transaction[];
  categories: Category[];
  accounts?: Account[];
  onRefetch: () => void;
}

export default function TransactionList({ transactions, categories, accounts = [], onRefetch }: Props) {
  const [editing, setEditing] = useState<Transaction | null>(null);
  const confirm = useConfirm();

  async function handleDelete(t: Transaction) {
    const ok = await confirm({
      title: "Eliminar transacción",
      description: `Se eliminará "${t.description}". Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/transactions/${t.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Transacción eliminada");
      onRefetch();
    } else {
      toast.error("No se pudo eliminar");
    }
  }

  if (!transactions.length) {
    return (
      <EmptyState
        icon={Receipt}
        title="No hay transacciones"
        description="Ajusta los filtros o agrega una nueva."
      />
    );
  }

  return (
    <>
      <div className="space-y-2">
        {transactions.map((t) => (
          <Card key={t.id} className="px-4 py-3">
            <TransactionRow
              transaction={t}
              actions={
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon-sm" aria-label="Acciones">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditing(t)}>
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => handleDelete(t)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            />
          </Card>
        ))}
      </div>

      <AppSheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title="Editar transacción" size="wide">
        {editing && (
          <TransactionForm
            categories={categories}
            accounts={accounts}
            transaction={editing}
            onSuccess={() => { setEditing(null); onRefetch(); }}
            onCancel={() => setEditing(null)}
          />
        )}
      </AppSheet>
    </>
  );
}
