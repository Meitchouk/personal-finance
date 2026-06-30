"use client";
import { useState } from "react";
import { useCategories } from "@/lib/hooks/useCategories";
import { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#10b981","#06b6d4","#3b82f6","#8b5cf6","#ec4899","#6b7280"];
const EMOJIS = ["🍔","🚗","🏠","💊","🎬","👕","📚","✈️","💪","🎮","🐶","☕","🛒","💰","🎁","⚡","📱","🍺","🎵","💅"];

const DEFAULT_FORM = { name: "", emoji: "⭐", color: "#10b981" };

export default function CategoriesPage() {
  const { categories, loading, refetch } = useCategories();
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  function openCreate() { setForm(DEFAULT_FORM); setCreating(true); setEditing(null); }
  function openEdit(c: Category) { setForm({ name: c.name, emoji: c.emoji, color: c.color }); setEditing(c); setCreating(false); }
  function closeSheet() { setCreating(false); setEditing(null); }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Escribe un nombre"); return; }
    setSaving(true);
    const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(editing ? "Categoría actualizada" : "Categoría creada");
      refetch();
      closeSheet();
    } else {
      const { error } = await res.json();
      toast.error(error ?? "Error");
    }
  }

  async function handleDelete(c: Category) {
    if (c.is_default) { toast.error("No puedes eliminar categorías predeterminadas"); return; }
    if (!confirm(`¿Eliminar "${c.name}"?`)) return;
    const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Categoría eliminada"); refetch(); }
  }

  const sheetOpen = creating || !!editing;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button className="bg-emerald-500 hover:bg-emerald-600" size="icon" onClick={openCreate}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {categories.map((c) => (
            <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: `${c.color}22` }}
              >
                {c.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{c.name}</p>
                {c.is_default && <p className="text-xs text-muted-foreground">Predeterminada</p>}
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-gray-600">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {!c.is_default && (
                  <button onClick={() => handleDelete(c)} className="text-gray-400 hover:text-rose-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={(o) => !o && closeSheet()}>
        <SheetContent side="bottom" className="h-auto rounded-t-2xl pb-8">
          <SheetHeader>
            <SheetTitle>{editing ? "Editar categoría" : "Nueva categoría"}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input
                placeholder="Ej: Restaurantes"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Emoji</Label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                    className={`text-xl w-10 h-10 rounded-lg transition-all ${form.emoji === e ? "bg-emerald-100 ring-2 ring-emerald-500 scale-110" : "bg-gray-100"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className={`w-8 h-8 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: `${form.color}33` }}>
                {form.emoji}
              </div>
              <span className="font-medium">{form.name || "Vista previa"}</span>
            </div>

            <Button className="w-full bg-emerald-500 hover:bg-emerald-600" onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : editing ? "Actualizar" : "Crear categoría"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
