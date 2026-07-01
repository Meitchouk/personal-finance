"use client";
import { useState } from "react";
import { useCategories } from "@/lib/hooks/useCategories";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useDebts } from "@/lib/hooks/useDebts";
import TransactionForm from "@/components/transactions/TransactionForm";
import AppSheet from "@/components/shared/AppSheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { toast } from "sonner";
import { TrendingDown, TrendingUp, HandCoins, Plus, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { Debt } from "@/lib/types";
import { format } from "date-fns";
import DateSelectFields from "@/components/shared/DateSelectFields";

interface QuickActionsProps {
  /** Active debts fetched server-side. Only shown when non-empty. */
  activeDebts: Debt[];
}

export default function QuickActions({ activeDebts }: QuickActionsProps) {
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { addItem, refetch: refetchDebts } = useDebts();
  const router = useRouter();

  // — Transaction sheet
  const [txOpen, setTxOpen] = useState(false);
  const [txType, setTxType] = useState<"expense" | "income">("expense");

  // — New debt sheet
  const [debtOpen, setDebtOpen] = useState(false);
  const [debtName, setDebtName] = useState("");
  const [savingDebt, setSavingDebt] = useState(false);

  // — Quick add-item to debt sheet
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string>(
    activeDebts[0]?.id ?? ""
  );
  const [itemDesc, setItemDesc] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [itemDate, setItemDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [savingItem, setSavingItem] = useState(false);

  function openTx(type: "expense" | "income") {
    setTxType(type);
    setTxOpen(true);
  }

  async function createDebt() {
    if (!debtName.trim()) return;
    setSavingDebt(true);
    const res = await fetch("/api/debts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creditor_name: debtName.trim() }),
    });
    setSavingDebt(false);
    if (res.ok) {
      toast.success("Deuda creada");
      setDebtName("");
      setDebtOpen(false);
      refetchDebts();
      router.push("/debts");
    } else {
      toast.error("Error al crear");
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(itemAmount);
    if (!selectedDebtId || !itemDesc.trim() || !Number.isFinite(amount) || amount <= 0) return;
    setSavingItem(true);
    try {
      await addItem(selectedDebtId, {
        description: itemDesc.trim(),
        amount,
        item_date: itemDate,
      });
      toast.success("Registro agregado al fiado");
      setItemDesc("");
      setItemAmount("");
      setItemDate(format(new Date(), "yyyy-MM-dd"));
      setAddItemOpen(false);
    } catch {
      toast.error("Error al agregar el registro");
    } finally {
      setSavingItem(false);
    }
  }

  const selectedDebt = activeDebts.find((d) => d.id === selectedDebtId);

  const baseActions = [
    {
      label: "Nuevo gasto",
      icon: TrendingDown,
      color: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/20",
      onClick: () => openTx("expense"),
    },
    {
      label: "Nuevo ingreso",
      icon: TrendingUp,
      color: "text-income",
      bg: "bg-income/10",
      border: "border-income/20",
      onClick: () => openTx("income"),
    },
    {
      label: "Agregar fiado",
      icon: HandCoins,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      onClick: () => setDebtOpen(true),
    },
    {
      label: "Ver deudas",
      icon: Plus,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      onClick: () => router.push("/debts"),
    },
  ];

  // Conditionally add the quick-add-item shortcut when there are active debts
  const debtQuickAction = activeDebts.length > 0
    ? [{
        label: "Agregar al fiado",
        icon: ShoppingBag,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        onClick: () => setAddItemOpen(true),
      }]
    : [];

  const actions = [...baseActions.slice(0, 2), ...debtQuickAction, ...baseActions.slice(2)];

  return (
    <>
      <div className={cn("grid gap-3", actions.length === 4 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3")}>
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all active:scale-95",
              a.bg, a.border
            )}
          >
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background/60", a.color)}>
              <a.icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium leading-tight">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Transaction form sheet */}
      <AppSheet
        open={txOpen}
        onOpenChange={(o) => { if (!o) setTxOpen(false); }}
        title={txType === "expense" ? "Nuevo gasto" : "Nuevo ingreso"}
        size="wide"
      >
        <TransactionForm
          key={txType}
          categories={categories}
          accounts={accounts}
          defaultValues={{ type: txType }}
          onSuccess={() => { setTxOpen(false); router.refresh(); }}
          onCancel={() => setTxOpen(false)}
        />
      </AppSheet>

      {/* New debt quick sheet */}
      <AppSheet open={debtOpen} onOpenChange={setDebtOpen} title="Agregar fiado">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿A quién le debes o dónde sacarás fiado?
          </p>
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input
              placeholder="Ej. Pulpería tía María…"
              value={debtName}
              onChange={(e) => setDebtName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createDebt()}
              autoFocus
            />
          </div>
          <Button
            className="w-full"
            onClick={createDebt}
            disabled={savingDebt || !debtName.trim()}
          >
            {savingDebt ? "Creando…" : "Crear y abrir"}
          </Button>
        </div>
      </AppSheet>

      {/* Quick add item to existing debt sheet */}
      {activeDebts.length > 0 && (
        <AppSheet open={addItemOpen} onOpenChange={setAddItemOpen} title="Agregar al fiado">
          <form onSubmit={handleAddItem} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Registra rápidamente un ítem en una de tus deudas activas.
            </p>

            {/* Debt selector — only shown when there are multiple debts */}
            {activeDebts.length > 1 && (
              <div className="space-y-1.5">
                <Label>Deuda</Label>
                <Select value={selectedDebtId} onValueChange={(v) => setSelectedDebtId(v ?? selectedDebtId)}>
                  <SelectTrigger className="w-full">
                    <span className="flex items-center gap-2">
                      <HandCoins className="h-4 w-4 text-amber-500" />
                      {selectedDebt?.creditor_name ?? "Selecciona una deuda"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {activeDebts.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.creditor_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Single debt label (no selector needed) */}
            {activeDebts.length === 1 && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                <HandCoins className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-sm font-medium">{activeDebts[0].creditor_name}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>¿Qué agarró fiado?</Label>
              <Input
                placeholder="Ej. Arroz, jabón, medicina…"
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label>Monto</Label>
              <Input
                placeholder="0.00"
                inputMode="decimal"
                value={itemAmount}
                onChange={(e) => setItemAmount(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Fecha</Label>
              <DateSelectFields
                value={itemDate}
                onChange={(d) => setItemDate(d ?? format(new Date(), "yyyy-MM-dd"))}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={savingItem || !itemDesc.trim() || !itemAmount || !selectedDebtId}
            >
              {savingItem ? "Guardando…" : "Agregar al fiado"}
            </Button>
          </form>
        </AppSheet>
      )}
    </>
  );
}
