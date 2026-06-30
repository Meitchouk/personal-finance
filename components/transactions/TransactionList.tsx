"use client";
import { useState } from "react";
import { Transaction, Category } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils/date-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, RefreshCw } from "lucide-react";
import TransactionForm from "./TransactionForm";
import { toast } from "sonner";

interface Props {
  transactions: Transaction[];
  categories: Category[];
  onRefetch: () => void;
}

export default function TransactionList({ transactions, categories, onRefetch }: Props) {
  const [editing, setEditing] = useState<Transaction | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta transacción?")) return;
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Transacción eliminada");
      onRefetch();
    }
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No hay transacciones. ¡Agrega una!
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: t.categories?.color ? `${t.categories.color}22` : "#f3f4f6" }}
            >
              {t.categories?.emoji ?? "💳"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{t.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                {t.categories && (
                  <Badge variant="outline" className="text-xs py-0 h-4" style={{ borderColor: t.categories.color, color: t.categories.color }}>
                    {t.categories.name}
                  </Badge>
                )}
                {t.is_recurring && <RefreshCw className="h-3 w-3 text-muted-foreground" />}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-sm ${t.type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
                {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>} />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditing(t)}>
                    <Pencil className="h-4 w-4 mr-2" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-rose-600" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="bottom" className="h-auto max-h-[90vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Editar transacción</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {editing && (
              <TransactionForm
                categories={categories}
                transaction={editing}
                onSuccess={() => { setEditing(null); onRefetch(); }}
                onCancel={() => setEditing(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
