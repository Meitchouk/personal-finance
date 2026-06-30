"use client";
import { useState } from "react";
import { useCategories } from "@/lib/hooks/useCategories";
import type { Category, TransactionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import PageHeader from "@/components/shared/PageHeader";
import CategoryIcon from "@/components/shared/CategoryIcon";
import IconPicker from "@/components/shared/IconPicker";
import ColorPicker from "@/components/shared/ColorPicker";
import { GridSkeleton } from "@/components/shared/Skeletons";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { DEFAULT_CATEGORY_COLOR } from "@/lib/constants";
import { DEFAULT_ICON_KEY } from "@/lib/icons";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: "expense", label: "Gasto" },
  { value: "income", label: "Ingreso" },
];

const BLANK = {
  name: "",
  icon: DEFAULT_ICON_KEY,
  color: DEFAULT_CATEGORY_COLOR,
  type: "expense" as TransactionType,
};

export default function CategoriesPage() {
  const { categories, loading, refetch } = useCategories();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setForm(BLANK);
    setEditing(null);
    setOpen(true);
  }
  function openEdit(c: Category) {
    setForm({ name: c.name, icon: c.icon, color: c.color, type: c.type });
    setEditing(c);
    setOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Escribe un nombre");
      return;
    }
    setSaving(true);
    const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(editing ? "Categoría actualizada" : "Categoría creada");
      refetch();
      setOpen(false);
    } else {
      const { error } = await res.json();
      toast.error(error ?? "Error");
    }
  }

  async function handleDelete(c: Category) {
    if (c.is_default) {
      toast.error("No puedes eliminar categorías predeterminadas");
      return;
    }
    const ok = await confirm({
      title: "Eliminar categoría",
      description: `Se eliminará "${c.name}". Las transacciones asociadas quedarán sin categoría.`,
      confirmLabel: "Eliminar",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Categoría eliminada");
      refetch();
    } else {
      toast.error("No se pudo eliminar");
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Categorías"
        action={
          <Button size="icon" aria-label="Nueva categoría" onClick={openCreate}>
            <Plus className="h-4 w-4" />
          </Button>
        }
      />

      {loading ? (
        <GridSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {categories.map((c) => (
            <Card key={c.id} className="flex flex-row items-center gap-3 p-3">
              <CategoryIcon category={c} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.type === "income" ? "Ingreso" : "Gasto"}
                  {c.is_default ? " · Predeterminada" : ""}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => openEdit(c)}
                  aria-label="Editar"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {!c.is_default && (
                  <button
                    onClick={() => handleDelete(c)}
                    aria-label="Eliminar"
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[90vh] overflow-y-auto rounded-t-2xl pb-8">
          <SheetHeader>
            <SheetTitle>{editing ? "Editar categoría" : "Nueva categoría"}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-5">
            <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
              <CategoryIcon iconKey={form.icon} color={form.color} size="lg" />
              <span className="font-medium">{form.name || "Vista previa"}</span>
            </div>

            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input
                placeholder="Ej: Restaurantes"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
                {TYPE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={form.type === option.value ? "default" : "ghost"}
                    onClick={() => setForm((f) => ({ ...f, type: option.value }))}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <ColorPicker value={form.color} onChange={(color) => setForm((f) => ({ ...f, color }))} />
            </div>

            <div className="space-y-2">
              <Label>Ícono</Label>
              <IconPicker
                value={form.icon}
                color={form.color}
                onChange={(icon) => setForm((f) => ({ ...f, icon }))}
              />
            </div>

            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : editing ? "Actualizar" : "Crear categoría"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
