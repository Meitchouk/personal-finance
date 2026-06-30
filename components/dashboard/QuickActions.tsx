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
import { toast } from "sonner";
import { TrendingDown, TrendingUp, HandCoins, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function QuickActions() {
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { refetch: refetchDebts } = useDebts();
  const router = useRouter();

  const [txOpen, setTxOpen] = useState(false);
  const [txType, setTxType] = useState<"expense" | "income">("expense");
  const [debtOpen, setDebtOpen] = useState(false);
  const [debtName, setDebtName] = useState("");
  const [savingDebt, setSavingDebt] = useState(false);

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

  const actions = [
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

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
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
    </>
  );
}
