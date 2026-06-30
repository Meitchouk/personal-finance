"use client";
import { useState } from "react";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import type { Account, AccountNature, AccountType } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import AppSheet from "@/components/shared/AppSheet";
import EmptyState from "@/components/shared/EmptyState";
import { RowsSkeleton } from "@/components/shared/Skeletons";
import ColorPicker from "@/components/shared/ColorPicker";
import { ACCOUNT_TYPE_LABELS, ACCOUNT_NATURE_LABELS, getAccountIcon } from "@/components/accounts/AccountBadge";
import { formatCurrency } from "@/lib/format";
import { Plus, Pencil, Trash2, Wallet, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPES: AccountType[] = ["bank", "card", "cash", "digital", "other"];

const DEFAULT_COLORS: Record<AccountType, string> = {
  bank: "#3b82f6",
  card: "#8b5cf6",
  cash: "#10b981",
  digital: "#0ea5e9",
  other: "#64748b",
};

interface FormState {
  name: string;
  type: AccountType;
  nature: AccountNature;
  color: string;
}

export default function AccountsPage() {
  const { accounts, loading, refetch } = useAccounts();
  const confirm = useConfirm();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", type: "bank", nature: "debit", color: DEFAULT_COLORS.bank });
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", type: "bank", nature: "debit", color: DEFAULT_COLORS.bank });
    setOpen(true);
  }

  function openEdit(a: Account) {
    setEditing(a);
    setForm({ name: a.name, type: a.type, nature: a.nature ?? "debit", color: a.color });
    setOpen(true);
  }

  function handleTypeChange(type: AccountType) {
    setForm((f) => ({
      ...f,
      type,
      color: editing ? f.color : DEFAULT_COLORS[type],
      // Cards default to credit; everything else to debit
      nature: editing ? f.nature : type === "card" ? "credit" : "debit",
    }));
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Escribe un nombre"); return; }
    setSaving(true);
    const url = editing ? `/api/accounts/${editing.id}` : "/api/accounts";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(editing ? "Cuenta actualizada" : "Cuenta creada");
      refetch();
      setOpen(false);
    } else {
      const { error } = await res.json();
      toast.error(error ?? "Error al guardar");
    }
  }

  async function handleDelete(a: Account) {
    const ok = await confirm({
      title: "Eliminar cuenta",
      description: `Se eliminará "${a.name}". Las transacciones vinculadas conservarán su historial.`,
      confirmLabel: "Eliminar",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/accounts/${a.id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Cuenta eliminada"); refetch(); }
  }

  const grouped = ACCOUNT_TYPES.reduce<Record<AccountType, Account[]>>((acc, type) => {
    acc[type] = accounts.filter((a) => a.type === type);
    return acc;
  }, { bank: [], card: [], cash: [], digital: [], other: [] });

  const TypeIcon = getAccountIcon(form.type);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Cuentas"
        subtitle="Bancos, tarjetas y efectivo"
        action={
          <Button size="icon" aria-label="Nueva cuenta" onClick={openCreate}>
            <Plus className="h-4 w-4" />
          </Button>
        }
      />

      {loading ? (
        <RowsSkeleton />
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Sin cuentas registradas"
          description="Agrega tus cuentas bancarias, tarjetas y efectivo para identificar el origen de cada transacción."
        />
      ) : (
        <div className="space-y-5">
          {ACCOUNT_TYPES.map((type) => {
            const group = grouped[type];
            if (group.length === 0) return null;
            return (
              <div key={type} className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {ACCOUNT_TYPE_LABELS[type]}
                </h3>
                <div className="space-y-2">
                  {group.map((a) => {
                    const Icon = getAccountIcon(a.type);
                    const isCredit = a.nature === "credit";
                    return (
                      <Card key={a.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                              style={{ backgroundColor: `${a.color}22` }}
                            >
                              <Icon className="h-4 w-4" style={{ color: a.color }} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-medium">{a.name}</p>
                                <span className={cn(
                                  "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold",
                                  isCredit
                                    ? "bg-purple-500/10 text-purple-500"
                                    : "bg-blue-500/10 text-blue-500"
                                )}>
                                  {ACCOUNT_NATURE_LABELS[a.nature ?? "debit"]}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">{ACCOUNT_TYPE_LABELS[a.type]}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => openEdit(a)} aria-label="Editar"
                                className="p-1.5 text-muted-foreground transition-colors hover:text-foreground">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleDelete(a)} aria-label="Eliminar"
                                className="p-1.5 text-muted-foreground transition-colors hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Credit balance */}
                          {isCredit && typeof a.credit_balance === "number" && a.credit_balance > 0 && (
                            <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-destructive/8 px-2.5 py-1.5">
                              <TrendingDown className="h-3.5 w-3.5 shrink-0 text-destructive" />
                              <span className="text-xs text-muted-foreground">Gasto acumulado:</span>
                              <span className="text-xs font-semibold text-destructive">
                                {formatCurrency(a.credit_balance, "NIO")}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AppSheet open={open} onOpenChange={setOpen} title={editing ? "Editar cuenta" : "Nueva cuenta"}>
        <div className="space-y-4">
          {/* Preview */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${form.color}22` }}
            >
              <TypeIcon className="h-5 w-5" style={{ color: form.color }} />
            </span>
            <div>
              <p className={cn("text-sm font-medium", !form.name && "text-muted-foreground")}>
                {form.name || "Nombre de la cuenta"}
              </p>
              <p className="text-xs text-muted-foreground">
                {ACCOUNT_TYPE_LABELS[form.type]} · {ACCOUNT_NATURE_LABELS[form.nature]}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input
              placeholder="Ej. BAC Ahorros, Visa Credomatic…"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => v && handleTypeChange(v as AccountType)}>
                <SelectTrigger className="w-full">
                  <span className="flex items-center gap-2">
                    <TypeIcon className="h-4 w-4" style={{ color: form.color }} />
                    {ACCOUNT_TYPE_LABELS[form.type]}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => {
                    const Icon = getAccountIcon(t);
                    return (
                      <SelectItem key={t} value={t}>
                        <Icon className="h-4 w-4" />
                        {ACCOUNT_TYPE_LABELS[t]}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Naturaleza</Label>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
                {(["debit", "credit"] as AccountNature[]).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, nature: n }))}
                    className={cn(
                      "rounded-lg py-1.5 text-xs font-medium transition-all",
                      form.nature === n
                        ? n === "credit"
                          ? "bg-card text-purple-500 shadow-sm"
                          : "bg-card text-blue-500 shadow-sm"
                        : "text-muted-foreground"
                    )}
                  >
                    {ACCOUNT_NATURE_LABELS[n]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <ColorPicker value={form.color} onChange={(c) => setForm((f) => ({ ...f, color: c }))} />
          </div>

          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando…" : editing ? "Actualizar" : "Crear cuenta"}
          </Button>
        </div>
      </AppSheet>
    </div>
  );
}
