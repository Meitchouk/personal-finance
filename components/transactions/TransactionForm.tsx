"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategoryIcon } from "@/lib/icons";
import { RECURRENCE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category, Transaction, TransactionType } from "@/lib/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  categories: Category[];
  transaction?: Transaction;
  onSuccess: () => void;
  onCancel: () => void;
}

const TYPE_TABS: { value: TransactionType; label: string; icon: typeof TrendingDown }[] = [
  { value: "expense", label: "Gasto", icon: TrendingDown },
  { value: "income", label: "Ingreso", icon: TrendingUp },
];

export default function TransactionForm({ categories, transaction, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: transaction?.amount?.toString() ?? "",
    type: (transaction?.type ?? "expense") as TransactionType,
    description: transaction?.description ?? "",
    category_id: transaction?.category_id ?? "",
    date: transaction?.date ?? format(new Date(), "yyyy-MM-dd"),
    is_recurring: transaction?.is_recurring ?? false,
    recurrence_rule: transaction?.recurrence_rule ?? "monthly",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    setLoading(true);

    const payload = {
      amount: parseFloat(form.amount),
      type: form.type,
      description: form.description,
      category_id: form.category_id || null,
      date: form.date,
      is_recurring: form.is_recurring,
      recurrence_rule: form.is_recurring ? form.recurrence_rule : null,
    };

    const url = transaction ? `/api/transactions/${transaction.id}` : "/api/transactions";
    const res = await fetch(url, {
      method: transaction ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (res.ok) {
      toast.success(transaction ? "Transacción actualizada" : "Transacción agregada");
      onSuccess();
    } else {
      const { error } = await res.json();
      toast.error(error ?? "Error al guardar");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
        {TYPE_TABS.map(({ value, label, icon: Icon }) => {
          const active = form.type === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => set("type", value)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all",
                active
                  ? value === "expense"
                    ? "bg-card text-expense shadow-sm"
                    : "bg-card text-income shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <Label>Monto</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => set("amount", e.target.value)}
          required
          className="text-lg"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Descripción</Label>
        <Input
          placeholder="¿En qué fue?"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Categoría</Label>
        <Select value={form.category_id} onValueChange={(v) => set("category_id", v ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => {
              const Icon = getCategoryIcon(c.icon);
              return (
                <SelectItem key={c.id} value={c.id}>
                  <Icon className="h-4 w-4" style={{ color: c.color }} />
                  {c.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Fecha</Label>
        <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.is_recurring}
          onChange={(e) => set("is_recurring", e.target.checked)}
          className="h-4 w-4 rounded border-border text-primary accent-[var(--primary)]"
        />
        <span className="text-sm">Transacción recurrente</span>
      </label>

      {form.is_recurring && (
        <div className="space-y-1.5">
          <Label>Frecuencia</Label>
          <Select value={form.recurrence_rule} onValueChange={(v) => set("recurrence_rule", v ?? "monthly")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECURRENCE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Guardando..." : transaction ? "Actualizar" : "Agregar"}
        </Button>
      </div>
    </form>
  );
}
