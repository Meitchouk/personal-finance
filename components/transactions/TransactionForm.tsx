"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category, Transaction, TransactionType } from "@/lib/types";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  categories: Category[];
  transaction?: Transaction;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TransactionForm({ categories, transaction, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: transaction?.amount?.toString() ?? "",
    type: (transaction?.type ?? "expense") as TransactionType,
    description: transaction?.description ?? "",
    category_id: transaction?.category_id ?? "" as string,
    date: transaction?.date ?? format(new Date(), "yyyy-MM-dd"),
    is_recurring: transaction?.is_recurring ?? false,
    recurrence_rule: transaction?.recurrence_rule ?? "monthly" as string,
  });

  function set(key: string, value: string | boolean) {
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
    const method = transaction ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
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
      {/* Type toggle */}
      <div className="flex rounded-lg border overflow-hidden">
        {(["expense", "income"] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => set("type", t)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              form.type === t
                ? t === "expense"
                  ? "bg-rose-500 text-white"
                  : "bg-emerald-500 text-white"
                : "bg-white text-gray-500"
            }`}
          >
            {t === "expense" ? "💸 Gasto" : "💰 Ingreso"}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <Label>Monto</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => set("amount", e.target.value)}
          required
          className="text-lg"
        />
      </div>

      <div className="space-y-1">
        <Label>Descripción</Label>
        <Input
          placeholder="¿En qué gastaste?"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <Label>Categoría</Label>
        <Select value={form.category_id} onValueChange={(v) => set("category_id", v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span>{c.emoji} {c.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Fecha</Label>
        <Input
          type="date"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
          required
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="recurring"
          checked={form.is_recurring}
          onChange={(e) => set("is_recurring", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-emerald-600"
        />
        <Label htmlFor="recurring">Transacción recurrente</Label>
      </div>

      {form.is_recurring && (
        <div className="space-y-1">
          <Label>Frecuencia</Label>
          <Select value={form.recurrence_rule} onValueChange={(v) => set("recurrence_rule", v ?? "monthly")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="biweekly">Quincenal</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-emerald-500 hover:bg-emerald-600"
          disabled={loading}
        >
          {loading ? "Guardando..." : transaction ? "Actualizar" : "Agregar"}
        </Button>
      </div>
    </form>
  );
}
