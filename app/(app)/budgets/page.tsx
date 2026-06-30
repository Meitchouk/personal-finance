"use client";
import { useState, useEffect } from "react";
import { useCategories } from "@/lib/hooks/useCategories";
import { useBudgets } from "@/lib/hooks/useBudgets";
import { Budget, Category } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, getCurrentMonthRange } from "@/lib/utils/date-helpers";

interface BudgetWithSpent extends Budget {
  spent: number;
}

export default function BudgetsPage() {
  const { categories } = useCategories();
  const { budgets, refetch } = useBudgets();
  const [spentMap, setSpentMap] = useState<Record<string, number>>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [form, setForm] = useState({ category_id: "", monthly_limit: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSpent() {
      const { from, to } = getCurrentMonthRange();
      const supabase = createClient();
      const { data } = await supabase
        .from("transactions")
        .select("category_id, amount")
        .eq("type", "expense")
        .gte("date", from)
        .lte("date", to);
      const map: Record<string, number> = {};
      (data ?? []).forEach((t: { category_id: string | null; amount: number }) => {
        if (t.category_id) map[t.category_id] = (map[t.category_id] ?? 0) + t.amount;
      });
      setSpentMap(map);
    }
    loadSpent();
  }, [budgets]);

  function openCreate() { setForm({ category_id: "", monthly_limit: "" }); setEditing(null); setSheetOpen(true); }
  function openEdit(b: Budget) { setForm({ category_id: b.category_id, monthly_limit: b.monthly_limit.toString() }); setEditing(b); setSheetOpen(true); }

  async function handleSave() {
    if (!form.category_id || !form.monthly_limit) { toast.error("Completa todos los campos"); return; }
    setSaving(true);
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category_id: form.category_id, monthly_limit: parseFloat(form.monthly_limit) }),
    });
    setSaving(false);
    if (res.ok) { toast.success(editing ? "Presupuesto actualizado" : "Presupuesto creado"); refetch(); setSheetOpen(false); }
    else { const { error } = await res.json(); toast.error(error); }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este presupuesto?")) return;
    const res = await fetch(`/api/budgets?id=${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Presupuesto eliminado"); refetch(); }
  }

  const budgetsWithSpent: BudgetWithSpent[] = budgets.map((b) => ({
    ...b,
    spent: spentMap[b.category_id] ?? 0,
  }));

  const usedCategoryIds = new Set(budgets.map((b) => b.category_id));
  const availableCategories = editing
    ? categories
    : categories.filter((c) => !usedCategoryIds.has(c.id));

  function getBudgetColor(pct: number) {
    if (pct >= 100) return "bg-rose-500";
    if (pct >= 75) return "bg-amber-400";
    return "bg-emerald-500";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Presupuesto</h1>
          <p className="text-sm text-muted-foreground">Este mes</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600" size="icon" onClick={openCreate}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {budgetsWithSpent.length === 0 ? (
        <Card className="shadow-sm border-0">
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            No tienes presupuestos. ¡Crea uno!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {budgetsWithSpent.map((b) => {
            const pct = Math.min((b.spent / b.monthly_limit) * 100, 100);
            const cat = b.categories as Category | null;
            return (
              <Card key={b.id} className="shadow-sm border-0">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat?.emoji}</span>
                      <span className="font-medium">{cat?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(b)} className="text-gray-400 hover:text-gray-600 p-1">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="text-gray-400 hover:text-rose-500 p-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${getBudgetColor(pct)}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatCurrency(b.spent)} gastado
                    </span>
                    <span className={pct >= 100 ? "text-rose-500 font-medium" : "text-muted-foreground"}>
                      {formatCurrency(b.monthly_limit)} límite
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={(o) => !o && setSheetOpen(false)}>
        <SheetContent side="bottom" className="h-auto rounded-t-2xl pb-8">
          <SheetHeader>
            <SheetTitle>{editing ? "Editar presupuesto" : "Nuevo presupuesto"}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-1">
              <Label>Categoría</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm((f) => ({ ...f, category_id: v ?? "" }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Límite mensual</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.monthly_limit}
                onChange={(e) => setForm((f) => ({ ...f, monthly_limit: e.target.value }))}
              />
            </div>
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600" onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : editing ? "Actualizar" : "Crear presupuesto"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
