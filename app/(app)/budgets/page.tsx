"use client";
import { useState, useEffect, useCallback } from "react";
import { useCategories } from "@/lib/hooks/useCategories";
import { useBudgets } from "@/lib/hooks/useBudgets";
import { usePreferences } from "@/components/providers/PreferencesProvider";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import type { Budget } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { expenseTotalsByCategory } from "@/lib/utils/aggregations";
import { getCurrentMonthRange } from "@/lib/utils/date-helpers";
import { formatMonthYear } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import AppSheet from "@/components/shared/AppSheet";
import CategoryIcon from "@/components/shared/CategoryIcon";
import EmptyState from "@/components/shared/EmptyState";
import { GridSkeleton } from "@/components/shared/Skeletons";
import { getCategoryIcon } from "@/lib/icons";
import { Plus, Trash2, Pencil, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function barColor(pct: number) {
  if (pct >= 100) return "bg-expense";
  if (pct >= 75) return "bg-amber-500";
  return "bg-income";
}

export default function BudgetsPage() {
  const { categories } = useCategories();
  const { budgets, loading, refetch } = useBudgets();
  const { formatMoney } = usePreferences();
  const confirm = useConfirm();

  const [spent, setSpent] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [form, setForm] = useState({ category_id: "", monthly_limit: "" });
  const [saving, setSaving] = useState(false);

  const loadSpent = useCallback(async () => {
    const { from, to } = getCurrentMonthRange();
    const supabase = createClient();
    const { data } = await supabase
      .from("transactions")
      .select("category_id, amount, type")
      .eq("type", "expense")
      .gte("date", from)
      .lte("date", to);
    setSpent(expenseTotalsByCategory(data ?? []));
  }, []);

  useEffect(() => {
    loadSpent();
  }, [loadSpent, budgets]);

  function openCreate() {
    setForm({ category_id: "", monthly_limit: "" });
    setEditing(null);
    setOpen(true);
  }
  function openEdit(b: Budget) {
    setForm({ category_id: b.category_id, monthly_limit: b.monthly_limit.toString() });
    setEditing(b);
    setOpen(true);
  }

  async function handleSave() {
    if (!form.category_id || !form.monthly_limit) {
      toast.error("Completa todos los campos");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category_id: form.category_id, monthly_limit: parseFloat(form.monthly_limit) }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(editing ? "Presupuesto actualizado" : "Presupuesto creado");
      refetch();
      setOpen(false);
    } else {
      const { error } = await res.json();
      toast.error(error);
    }
  }

  async function handleDelete(b: Budget) {
    const ok = await confirm({
      title: "Eliminar presupuesto",
      description: `Se eliminará el límite de "${b.categories?.name}".`,
      confirmLabel: "Eliminar",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/budgets?id=${b.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Presupuesto eliminado");
      refetch();
    }
  }

  const expenseCategories = categories.filter((category) => category.type === "expense");
  const usedIds = new Set(budgets.map((b) => b.category_id));
  const availableCategories = editing
    ? expenseCategories
    : expenseCategories.filter((c) => !usedIds.has(c.id));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Presupuesto"
        subtitle={formatMonthYear()}
        action={
          <Button size="icon" aria-label="Nuevo presupuesto" onClick={openCreate}>
            <Plus className="h-4 w-4" />
          </Button>
        }
      />

      {loading ? (
        <GridSkeleton count={4} />
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Sin presupuestos"
          description="Define un límite mensual por categoría para controlar tus gastos."
        />
      ) : (
        <div className="space-y-3">
          {budgets.map((b) => {
            const used = spent[b.category_id] ?? 0;
            const pct = Math.min((used / b.monthly_limit) * 100, 100);
            const over = used > b.monthly_limit;
            return (
              <Card key={b.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={b.categories} size="sm" />
                      <span className="font-medium">{b.categories?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(b)}
                        aria-label="Editar"
                        className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
                        aria-label="Eliminar"
                        className="p-1 text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full transition-all", barColor(pct))} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={cn("tabular-nums", over ? "font-medium text-expense" : "text-muted-foreground")}>
                      {formatMoney(used)}
                    </span>
                    <span className="text-muted-foreground tabular-nums">de {formatMoney(b.monthly_limit)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AppSheet open={open} onOpenChange={setOpen} title={editing ? "Editar presupuesto" : "Nuevo presupuesto"}>
        <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm((f) => ({ ...f, category_id: v ?? "" }))}
                disabled={!!editing}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((c) => {
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
              <Label>Límite mensual</Label>
              <Input
                inputMode="decimal"
                placeholder="0.00"
                value={form.monthly_limit}
                onChange={(e) => setForm((f) => ({ ...f, monthly_limit: e.target.value }))}
              />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : editing ? "Actualizar" : "Crear presupuesto"}
            </Button>
        </div>
      </AppSheet>
    </div>
  );
}
