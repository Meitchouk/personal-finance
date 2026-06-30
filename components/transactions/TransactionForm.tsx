"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import DateSelectFields from "@/components/shared/DateSelectFields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategoryIcon } from "@/lib/icons";
import { RECURRENCE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { BASE_CURRENCY, DEFAULT_EXCHANGE_RATES, roundMoney } from "@/lib/currency";
import { CURRENCIES, formatCurrency, type CurrencyCode } from "@/lib/format";
import type { Category, Transaction, TransactionType } from "@/lib/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowRightLeft, TrendingDown, TrendingUp } from "lucide-react";

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
  const [rates, setRates] = useState(DEFAULT_EXCHANGE_RATES);
  const [form, setForm] = useState({
    amount: (transaction?.original_amount ?? transaction?.amount)?.toString() ?? "",
    original_currency: (transaction?.original_currency ?? BASE_CURRENCY) as CurrencyCode,
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

  useEffect(() => {
    let active = true;

    fetch("/api/exchange-rates")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(({ data }) => {
        if (active && Array.isArray(data) && data.length) {
          setRates(
            data.map((rate) => ({
              source_currency: rate.source_currency,
              target_currency: rate.target_currency,
              rate: Number(rate.rate),
            }))
          );
        }
      })
      .catch(() => {
        if (active) setRates(DEFAULT_EXCHANGE_RATES);
      });

    return () => {
      active = false;
    };
  }, []);

  const exchangeRate = useMemo(() => {
    const rate = rates.find(
      (r) =>
        r.source_currency === form.original_currency &&
        r.target_currency === BASE_CURRENCY
    );
    return rate?.rate ?? 1;
  }, [form.original_currency, rates]);

  const originalAmount = parseFloat(form.amount);
  const convertedAmount =
    Number.isFinite(originalAmount) && originalAmount > 0
      ? roundMoney(originalAmount * exchangeRate)
      : 0;
  const availableCategories = categories.filter((category) => category.type === form.type);

  useEffect(() => {
    if (!form.category_id) return;
    const selected = categories.find((category) => category.id === form.category_id);
    if (selected && selected.type !== form.type) {
      setForm((current) => ({ ...current, category_id: "" }));
    }
  }, [categories, form.category_id, form.type]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    setLoading(true);

    const payload = {
      original_amount: parseFloat(form.amount),
      original_currency: form.original_currency,
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
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
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

      <div className="grid gap-3 md:grid-cols-[1fr_12rem]">
        <div className="space-y-1.5">
          <Label>Monto</Label>
          <Input
            inputMode="decimal"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            required
            className="text-lg"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Moneda</Label>
          <Select
            value={form.original_currency}
            onValueChange={(v) => set("original_currency", (v as CurrencyCode) ?? BASE_CURRENCY)}
          >
            <SelectTrigger className="w-full">
              {(() => {
                const cur = CURRENCIES[form.original_currency];
                return cur ? (
                  <span className="font-medium">{cur.symbol} {cur.code}</span>
                ) : (
                  <span className="text-muted-foreground">Moneda</span>
                );
              })()}
            </SelectTrigger>
            <SelectContent>
              {Object.values(CURRENCIES).map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <ArrowRightLeft className="h-3.5 w-3.5" />
          Conversión guardada en {BASE_CURRENCY}
        </div>
        <p className="mt-1 text-sm">
          {form.original_currency === BASE_CURRENCY
            ? "No se aplica conversión para córdobas."
            : `${formatCurrency(originalAmount || 0, form.original_currency)} = ${formatCurrency(convertedAmount, BASE_CURRENCY)}`}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Tasa usada: 1 {form.original_currency} = {exchangeRate.toFixed(4)} {BASE_CURRENCY}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
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
              {(() => {
                const cat = availableCategories.find((c) => c.id === form.category_id);
                if (!cat) return <span className="text-muted-foreground">Selecciona una categoría</span>;
                const CatIcon = getCategoryIcon(cat.icon);
                return (
                  <span className="flex items-center gap-2">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${cat.color}22` }}
                    >
                      <CatIcon className="h-3 w-3" style={{ color: cat.color }} />
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </span>
                );
              })()}
            </SelectTrigger>
            <SelectContent>
              {availableCategories.length === 0 ? (
                <SelectItem value="__empty" disabled>
                  No hay categorías de {form.type === "income" ? "ingreso" : "gasto"}
                </SelectItem>
              ) : (
                availableCategories.map((c) => {
                  const Icon = getCategoryIcon(c.icon);
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${c.color}22` }}
                      >
                        <Icon className="h-3 w-3" style={{ color: c.color }} />
                      </span>
                      {c.name}
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Fecha</Label>
        <DateSelectFields
          value={form.date}
          onChange={(date) => set("date", date ?? format(new Date(), "yyyy-MM-dd"))}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-pressed={form.is_recurring}
          onClick={() => set("is_recurring", !form.is_recurring)}
          className={cn(
            "flex h-10 flex-1 items-center gap-3 rounded-lg border px-3 text-left transition-colors",
            form.is_recurring
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border text-muted-foreground hover:bg-muted"
          )}
        >
          <span
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded border",
              form.is_recurring ? "border-primary bg-primary" : "border-border"
            )}
          >
            {form.is_recurring && <span className="size-1.5 rounded-full bg-primary-foreground" />}
          </span>
          <span className="text-sm">Transacción recurrente</span>
        </button>

        {form.is_recurring && (
          <Select
            value={form.recurrence_rule}
            onValueChange={(v) => set("recurrence_rule", v ?? "monthly")}
          >
            <SelectTrigger className="w-32 shrink-0">
              {(() => {
                const opt = RECURRENCE_OPTIONS.find((o) => o.value === form.recurrence_rule);
                return opt ? (
                  <span>{opt.label}</span>
                ) : (
                  <span className="text-muted-foreground">Frecuencia</span>
                );
              })()}
            </SelectTrigger>
            <SelectContent align="end">
              {RECURRENCE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex gap-3 pt-2 md:justify-end">
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
