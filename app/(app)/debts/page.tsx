"use client";
import { useState } from "react";
import { useDebts } from "@/lib/hooks/useDebts";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useCategories } from "@/lib/hooks/useCategories";
import type { Account, Debt, DebtItem, DebtProduct } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import AppSheet from "@/components/shared/AppSheet";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { RowsSkeleton } from "@/components/shared/Skeletons";
import DateSelectFields from "@/components/shared/DateSelectFields";
import { getAccountIcon, ACCOUNT_TYPE_LABELS } from "@/components/accounts/AccountBadge";
import { getCategoryIcon } from "@/lib/icons";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Plus, HandCoins, Check, Trash2, ChevronDown, ChevronRight,
  CreditCard, TrendingDown, MoreVertical, BookOpen, Pencil, Package,
  Bookmark, BookmarkCheck,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Catalog management sheet ─────────────────────────────────────────────────
function CatalogSheet({
  debt, open, onClose, onAddProduct, onDeleteProduct, onUpdateProduct,
}: {
  debt: Debt; open: boolean; onClose: () => void;
  onAddProduct: (name: string, unit_price: number, unit: string) => Promise<unknown>;
  onDeleteProduct: (id: string) => Promise<void>;
  onUpdateProduct: (id: string, body: { name?: string; unit_price?: number; unit?: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string; price: string; unit: string } | null>(null);

  const products = debt.debt_products ?? [];

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const p = parseFloat(price);
    if (!name.trim() || !Number.isFinite(p) || p <= 0) return;
    setAdding(true);
    try { await onAddProduct(name.trim(), p, unit.trim()); setName(""); setPrice(""); setUnit(""); }
    finally { setAdding(false); }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const p = parseFloat(editing.price);
    if (!editing.name.trim() || !Number.isFinite(p) || p <= 0) return;
    await onUpdateProduct(editing.id, { name: editing.name.trim(), unit_price: p, unit: editing.unit.trim() || undefined });
    setEditing(null);
  }

  return (
    <AppSheet open={open} onOpenChange={(o) => !o && onClose()} title={`Catálogo — ${debt.creditor_name}`}>
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Define los productos o servicios que compras aquí. Al agregar al fiado podrás seleccionarlos con el precio ya cargado.
        </p>

        {products.length > 0 && (
          <div className="space-y-1">
            {products.map((p) => (
              <div key={p.id}>
                {editing?.id === p.id ? (
                  <form onSubmit={handleUpdate} className="flex flex-col gap-2 rounded-lg border border-primary/40 bg-muted/30 p-2.5">
                    <div className="flex gap-2">
                      <Input value={editing.name} onChange={(e) => setEditing((v) => v && ({ ...v, name: e.target.value }))}
                        placeholder="Nombre" className="flex-1 h-8 text-sm" />
                      <Input value={editing.price} onChange={(e) => setEditing((v) => v && ({ ...v, price: e.target.value }))}
                        placeholder="Precio" inputMode="decimal" className="w-24 h-8 text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <Input value={editing.unit} onChange={(e) => setEditing((v) => v && ({ ...v, unit: e.target.value }))}
                        placeholder="Unidad (ej. litro, libra)" className="flex-1 h-8 text-xs" />
                      <Button type="submit" size="sm" className="h-8 text-xs">Guardar</Button>
                      <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setEditing(null)}>✕</Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                    <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium">{p.name}</span>
                      {p.unit && <span className="ml-1 text-xs text-muted-foreground">/ {p.unit}</span>}
                    </div>
                    <span className="shrink-0 text-sm font-semibold">{formatCurrency(p.unit_price, "NIO")}</span>
                    <button onClick={() => setEditing({ id: p.id, name: p.name, price: String(p.unit_price), unit: p.unit ?? "" })}
                      className="p-1 text-muted-foreground hover:text-foreground"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => onDeleteProduct(p.id)} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Nuevo producto</p>
          <div className="flex gap-2">
            <Input placeholder="Nombre del producto" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 h-9 text-sm" />
            <Input placeholder="Precio" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className="w-24 h-9 text-sm" />
          </div>
          <div className="flex gap-2">
            <Input placeholder="Unidad (ej. litro, libra, unidad)" value={unit} onChange={(e) => setUnit(e.target.value)} className="flex-1 h-9 text-xs" />
            <Button type="submit" size="sm" className="h-9 shrink-0" disabled={adding || !name.trim() || !price}>
              <Plus className="h-4 w-4" /> Agregar
            </Button>
          </div>
        </form>
      </div>
    </AppSheet>
  );
}

// ─── Add item form ─────────────────────────────────────────────────────────────
function AddItemForm({
  debt, onAdd, onAddProduct,
}: {
  debt: Debt;
  onAdd: (description: string, amount: number, item_date: string) => Promise<unknown>;
  onAddProduct: (name: string, unit_price: number, unit?: string) => Promise<unknown>;
}) {
  const products = debt.debt_products ?? [];
  const hasProducts = products.length > 0;
  const [mode, setMode] = useState<"catalog" | "manual">(hasProducts ? "catalog" : "manual");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);
  const [manualDesc, setManualDesc] = useState("");
  const [manualAmount, setManualAmount] = useState("");

  function setQty(productId: string, val: string) {
    setQuantities((q) => ({ ...q, [productId]: val }));
  }

  const selectedItems = products
    .map((p) => ({ product: p, qty: parseFloat(quantities[p.id] ?? "") }))
    .filter((x) => Number.isFinite(x.qty) && x.qty > 0);

  const catalogTotal = selectedItems.reduce((s, x) => s + x.qty * x.product.unit_price, 0);

  async function submitCatalog(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItems.length) return;
    setLoading(true);
    try {
      for (const { product, qty } of selectedItems) {
        const desc = qty === 1 ? product.name : `${qty}× ${product.name}`;
        await onAdd(desc, qty * product.unit_price, date);
      }
      setQuantities({});
    } finally { setLoading(false); }
  }

  async function submitManual(e: React.FormEvent) {
    e.preventDefault();
    const a = parseFloat(manualAmount);
    if (!manualDesc.trim() || !Number.isFinite(a) || a <= 0) return;
    setLoading(true);
    try {
      await onAdd(manualDesc.trim(), a, date);
      // Auto-add to catalog if name doesn't already exist
      const existsInCatalog = products.some(
        (p) => p.name.toLowerCase() === manualDesc.trim().toLowerCase()
      );
      if (!existsInCatalog) {
        await onAddProduct(manualDesc.trim(), a);
      }
      setManualDesc(""); setManualAmount("");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-border bg-muted/30 p-3">
      {hasProducts && (
        <div className="flex gap-1 rounded-lg bg-muted p-0.5 text-xs">
          {(["catalog", "manual"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={cn("flex-1 rounded-md py-1 font-medium transition-all",
                mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
              {m === "catalog" ? "Del catálogo" : "Manual"}
            </button>
          ))}
        </div>
      )}

      {mode === "catalog" && hasProducts && (
        <form onSubmit={submitCatalog} className="space-y-2">
          <div className="space-y-1">
            {products.map((p) => {
              const qty = quantities[p.id] ?? "";
              const parsedQty = parseFloat(qty);
              const subtotal = Number.isFinite(parsedQty) && parsedQty > 0 ? parsedQty * p.unit_price : 0;
              return (
                <div key={p.id} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(p.unit_price, "NIO")}{p.unit ? ` / ${p.unit}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button type="button"
                      onClick={() => { const cur = parseFloat(qty) || 0; setQty(p.id, cur > 1 ? String(cur - 1) : ""); }}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted">−</button>
                    <Input value={qty} onChange={(e) => setQty(p.id, e.target.value)}
                      placeholder="0" inputMode="decimal" className="h-7 w-14 text-center text-sm" />
                    <button type="button"
                      onClick={() => setQty(p.id, String((parseFloat(qty) || 0) + 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted">+</button>
                    <span className={cn("w-16 text-right text-xs font-medium", subtotal > 0 ? "text-foreground" : "text-muted-foreground")}>
                      {subtotal > 0 ? formatCurrency(subtotal, "NIO") : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <DateSelectFields value={date} onChange={(d) => setDate(d ?? format(new Date(), "yyyy-MM-dd"))} />
          <div className="flex items-center justify-between">
            {catalogTotal > 0
              ? <span className="text-sm font-semibold">Total: {formatCurrency(catalogTotal, "NIO")}</span>
              : <span className="text-xs text-muted-foreground">Selecciona cantidades</span>}
            <Button type="submit" size="sm" className="h-8 text-xs" disabled={loading || !selectedItems.length}>
              {loading ? "Agregando…" : "Agregar al fiado"}
            </Button>
          </div>
        </form>
      )}

      {mode === "manual" && (
        <form onSubmit={submitManual} className="space-y-2">
          <div className="flex gap-2">
            <Input placeholder="¿Qué agarró fiado?" value={manualDesc} onChange={(e) => setManualDesc(e.target.value)} className="flex-1 h-8 text-sm" />
            <Input placeholder="Monto" inputMode="decimal" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} className="w-24 h-8 text-sm" />
          </div>
          <DateSelectFields value={date} onChange={(d) => setDate(d ?? format(new Date(), "yyyy-MM-dd"))} />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Se agregará al catálogo automáticamente</p>
            <Button type="submit" size="sm" className="h-8 text-xs" disabled={loading || !manualDesc.trim() || !manualAmount}>
              Agregar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Settle sheet ──────────────────────────────────────────────────────────────
type PayMode = "settle" | "settle_items" | "settle_partial";

function SettleSheet({
  debt, open, onClose, accounts, categories, onSettle,
}: {
  debt: Debt | null; open: boolean; onClose: () => void;
  accounts: Account[];
  categories: { id: string; name: string; icon: string; color: string; type: string }[];
  onSettle: (opts: {
    action: PayMode;
    item_ids?: string[];
    paid_amount?: number;
    account_id?: string;
    category_id?: string;
    date: string;
  }) => Promise<void>;
}) {
  const [mode, setMode] = useState<PayMode>("settle");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [partialAmount, setPartialAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);

  if (!debt) return null;

  const unpaid = (debt.debt_items ?? []).filter((i) => !i.is_paid);
  const total = unpaid.reduce((s, i) => s + Number(i.amount), 0);
  const selectedTotal = unpaid.filter((i) => selectedIds.has(i.id)).reduce((s, i) => s + Number(i.amount), 0);
  const paidPartial = parseFloat(partialAmount) || 0;
  const remainder = Math.max(0, Math.round((total - paidPartial) * 100) / 100);

  const debitAccounts = accounts.filter((a) => a.nature !== "credit");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function canConfirm() {
    if (mode === "settle") return total > 0;
    if (mode === "settle_items") return selectedIds.size > 0;
    if (mode === "settle_partial") return paidPartial > 0 && paidPartial < total;
    return false;
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      await onSettle({
        action: mode,
        item_ids: mode === "settle_items" ? [...selectedIds] : undefined,
        paid_amount: mode === "settle_partial" ? paidPartial : undefined,
        account_id: accountId || undefined,
        category_id: categoryId || undefined,
        date,
      });
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al pagar");
    } finally { setLoading(false); }
  }

  const MODES: { value: PayMode; label: string; desc: string }[] = [
    { value: "settle", label: "Todo", desc: `${formatCurrency(total, "NIO")}` },
    { value: "settle_items", label: "Productos", desc: "Seleccionar cuáles" },
    { value: "settle_partial", label: "Abono", desc: "Monto parcial" },
  ];

  return (
    <AppSheet open={open} onOpenChange={(o) => !o && onClose()} title={`Pagar — ${debt.creditor_name}`}>
      <div className="space-y-4">

        {/* Mode picker */}
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {MODES.map((m) => (
            <button key={m.value} type="button" onClick={() => setMode(m.value)}
              className={cn("flex flex-col items-center rounded-lg px-2 py-2 transition-all",
                mode === m.value ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              <span className="text-xs font-semibold">{m.label}</span>
              <span className={cn("text-[10px]", mode === m.value ? "text-muted-foreground" : "text-muted-foreground/60")}>{m.desc}</span>
            </button>
          ))}
        </div>

        {/* Amount display */}
        {mode === "settle" && (
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-xs text-muted-foreground">Total a pagar</p>
            <p className="text-3xl font-bold">{formatCurrency(total, "NIO")}</p>
            <p className="text-xs text-muted-foreground">{unpaid.length} artículo{unpaid.length !== 1 ? "s" : ""} pendiente{unpaid.length !== 1 ? "s" : ""}</p>
          </div>
        )}

        {/* Item selection */}
        {mode === "settle_items" && (
          <div className="space-y-1">
            {unpaid.map((item) => {
              const checked = selectedIds.has(item.id);
              return (
                <button key={item.id} type="button" onClick={() => toggleItem(item.id)}
                  className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                    checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50")}>
                  <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                    checked ? "border-primary bg-primary" : "border-border")}>
                    {checked && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{item.description}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(item.item_date)}</span>
                  <span className="shrink-0 text-sm font-medium">{formatCurrency(Number(item.amount), "NIO")}</span>
                </button>
              );
            })}
            {selectedIds.size > 0 && (
              <div className="flex justify-between rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-xs text-muted-foreground">{selectedIds.size} seleccionado{selectedIds.size !== 1 ? "s" : ""}</span>
                <span className="text-sm font-semibold">{formatCurrency(selectedTotal, "NIO")}</span>
              </div>
            )}
          </div>
        )}

        {/* Partial amount */}
        {mode === "settle_partial" && (
          <div className="space-y-3">
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total adeudado</span>
                <span className="font-medium">{formatCurrency(total, "NIO")}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Monto que vas a pagar</Label>
              <Input placeholder="0.00" inputMode="decimal" value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)} className="text-lg" />
            </div>
            {paidPartial > 0 && paidPartial < total && (
              <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                <span className="text-xs text-muted-foreground">Quedará pendiente</span>
                <span className="text-sm font-semibold text-amber-600">{formatCurrency(remainder, "NIO")}</span>
              </div>
            )}
            {paidPartial >= total && total > 0 && (
              <p className="text-xs text-income">Cubre el total — usa "Todo" en su lugar</p>
            )}
          </div>
        )}

        {/* Account selector — always shown */}
        <div className="space-y-1.5">
          <Label>Origen del pago</Label>
          <Select value={accountId} onValueChange={(v) => setAccountId(v ?? "")}>
            <SelectTrigger className="w-full">
              {(() => {
                const a = debitAccounts.find((x) => x.id === accountId);
                if (!a) return <span className="text-muted-foreground">Sin cuenta específica</span>;
                const Icon = getAccountIcon(a.type);
                return <span className="flex items-center gap-2"><Icon className="h-4 w-4" style={{ color: a.color }} />{a.name}</span>;
              })()}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin cuenta específica</SelectItem>
              {debitAccounts.map((a) => {
                const Icon = getAccountIcon(a.type);
                return (
                  <SelectItem key={a.id} value={a.id}>
                    <Icon className="h-4 w-4" style={{ color: a.color }} />
                    {a.name}
                    <span className="ml-1 text-xs text-muted-foreground">{ACCOUNT_TYPE_LABELS[a.type]}</span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Category selector */}
        {expenseCategories.length > 0 && (
          <div className="space-y-1.5">
            <Label>Categoría <span className="text-xs font-normal text-muted-foreground">(opcional)</span></Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
              <SelectTrigger className="w-full">
                {(() => {
                  const c = expenseCategories.find((x) => x.id === categoryId);
                  if (!c) return <span className="text-muted-foreground">Sin categoría</span>;
                  const Icon = getCategoryIcon(c.icon);
                  return <span className="flex items-center gap-2"><Icon className="h-4 w-4" style={{ color: c.color }} />{c.name}</span>;
                })()}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin categoría</SelectItem>
                {expenseCategories.map((c) => {
                  const Icon = getCategoryIcon(c.icon);
                  return <SelectItem key={c.id} value={c.id}><Icon className="h-4 w-4" style={{ color: c.color }} />{c.name}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Date */}
        <div className="space-y-1.5">
          <Label>Fecha del pago</Label>
          <DateSelectFields value={date} onChange={(d) => setDate(d ?? format(new Date(), "yyyy-MM-dd"))} />
        </div>

        {/* Confirm */}
        <Button className="w-full" onClick={handleConfirm} disabled={loading || !canConfirm()}>
          {loading ? "Procesando…" : "Confirmar pago"}
        </Button>

        {mode === "settle_partial" && canConfirm() && (
          <p className="text-center text-xs text-muted-foreground">
            Se registrará un gasto de {formatCurrency(paidPartial, "NIO")} y quedará pendiente {formatCurrency(remainder, "NIO")} como "Restante a pagar"
          </p>
        )}
      </div>
    </AppSheet>
  );
}

// ─── Inline item editor ────────────────────────────────────────────────────────
function EditItemRow({
  item, onSave, onCancel,
}: {
  item: DebtItem;
  onSave: (desc: string, qty: number, unitPrice: number) => Promise<void>;
  onCancel: () => void;
}) {
  const qty = item.quantity ?? 1;
  const unitPrice = qty > 0 ? Number(item.amount) / qty : Number(item.amount);

  const [desc, setDesc] = useState(item.description);
  const [q, setQ] = useState(String(qty));
  const [price, setPrice] = useState(String(Math.round(unitPrice * 100) / 100));
  const [saving, setSaving] = useState(false);

  const parsedQ = Math.max(1, parseInt(q) || 1);
  const parsedPrice = parseFloat(price) || 0;
  const total = Math.round(parsedQ * parsedPrice * 100) / 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!desc.trim() || parsedPrice <= 0) return;
    setSaving(true);
    try { await onSave(desc.trim(), parsedQ, parsedPrice); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5 py-1.5">
      <Input
        autoFocus
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Descripción"
        className="h-8 text-sm"
      />
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 shrink-0">
          <button type="button"
            onClick={() => setQ((v) => String(Math.max(1, (parseInt(v) || 1) - 1)))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted">−</button>
          <Input value={q} onChange={(e) => setQ(e.target.value)} inputMode="numeric"
            className="h-7 w-12 text-center text-sm" />
          <button type="button"
            onClick={() => setQ((v) => String((parseInt(v) || 1) + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted">+</button>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">×</span>
        <Input value={price} onChange={(e) => setPrice(e.target.value)}
          inputMode="decimal" placeholder="Precio unit." className="h-7 flex-1 text-sm" />
        <span className="shrink-0 text-sm font-semibold">
          = {formatCurrency(total, "NIO")}
        </span>
        <button type="submit" disabled={saving || !desc.trim() || parsedPrice <= 0}
          className="shrink-0 p-1 text-income disabled:opacity-40">
          <Check className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={onCancel}
          className="shrink-0 p-1 text-muted-foreground hover:text-foreground text-xs">✕</button>
      </div>
    </form>
  );
}

// ─── Debt card ─────────────────────────────────────────────────────────────────
function DebtCard({
  debt, onToggleItem, onDeleteItem, onUpdateItem, onAddItem, onDeleteDebt, onSettle, onOpenCatalog, onAddProduct, onToggleSaved,
}: {
  debt: Debt;
  onToggleItem: (item: DebtItem) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, body: { description?: string; amount?: number; quantity?: number; unit_price?: number }) => Promise<void>;
  onAddItem: (description: string, amount: number, item_date: string) => Promise<unknown>;
  onDeleteDebt: () => void;
  onSettle: () => void;
  onOpenCatalog: () => void;
  onAddProduct: (name: string, unit_price: number, unit?: string) => Promise<unknown>;
  onToggleSaved: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [showPaid, setShowPaid] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const items = debt.debt_items ?? [];
  const unpaid = items.filter((i) => !i.is_paid);
  const paid = items.filter((i) => i.is_paid);
  const total = unpaid.reduce((s, i) => s + Number(i.amount), 0);
  const hasCatalog = (debt.debt_products ?? []).length > 0;

  return (
    <Card>
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
            <HandCoins className="h-4 w-4 text-amber-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{debt.creditor_name}</p>
              {debt.is_saved && (
                <BookmarkCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
              )}
              {hasCatalog && (
                <span className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-500">
                  <Package className="h-2.5 w-2.5" /> catálogo
                </span>
              )}
            </div>
            {total > 0
              ? <p className="text-xs font-medium text-destructive">{formatCurrency(total, "NIO")} pendiente</p>
              : <p className="text-xs text-income font-medium">Al día ✓</p>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="p-1.5 text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            } />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSettle} disabled={total === 0}>
                <HandCoins className="mr-2 h-4 w-4" />
                {total > 0 ? `Pagar — ${formatCurrency(total, "NIO")}` : "Pagar (sin pendientes)"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleSaved}>
                {debt.is_saved
                  ? <><BookmarkCheck className="mr-2 h-4 w-4 text-primary" /> Quitar de guardados</>
                  : <><Bookmark className="mr-2 h-4 w-4" /> Guardar</>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenCatalog}>
                <BookOpen className="mr-2 h-4 w-4" />
                {hasCatalog ? "Editar catálogo" : "Agregar catálogo"}
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onDeleteDebt}>
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar deuda
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Unpaid items */}
        {(unpaid.length > 0 || paid.length > 0) && (
          <div className="border-t border-border px-4 py-2 space-y-1">
            {unpaid.map((item) => (
              <div key={item.id}>
                {editingId === item.id ? (
                  <EditItemRow
                    item={item}
                    onSave={async (desc, qty, unitPrice) => {
                      await onUpdateItem(item.id, { description: desc, quantity: qty, unit_price: unitPrice });
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="group flex items-center gap-2 py-1">
                    <button onClick={() => onToggleItem(item)}
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border text-muted-foreground hover:border-primary hover:text-primary">
                      <span className="sr-only">Marcar pagado</span>
                    </button>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {(item.quantity ?? 1) > 1 && (
                        <span className="mr-1 text-xs font-semibold text-muted-foreground">{item.quantity}×</span>
                      )}
                      {item.description}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDate(item.item_date)}</span>
                    <div className="shrink-0 text-right">
                      <span className="text-sm font-medium">{formatCurrency(Number(item.amount), "NIO")}</span>
                      {(item.quantity ?? 1) > 1 && (
                        <p className="text-[10px] text-muted-foreground">
                          {formatCurrency(Number(item.amount) / item.quantity, "NIO")} c/u
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setEditingId(item.id)}
                      className="shrink-0 p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity">
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button onClick={() => onDeleteItem(item.id)} className="shrink-0 p-0.5 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {paid.length > 0 && (
              <div>
                <button onClick={() => setShowPaid((v) => !v)}
                  className="flex items-center gap-1 py-1 text-xs text-muted-foreground hover:text-foreground">
                  {showPaid ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  {paid.length} artículo{paid.length > 1 ? "s" : ""} pagado{paid.length > 1 ? "s" : ""}
                </button>
                {showPaid && paid.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 py-1 opacity-50">
                    <button onClick={() => onToggleItem(item)} className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-income bg-income/10">
                      <Check className="h-2.5 w-2.5 text-income" />
                    </button>
                    <span className="min-w-0 flex-1 truncate text-sm line-through">{item.description}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDate(item.item_date)}</span>
                    <span className="shrink-0 text-sm">{formatCurrency(Number(item.amount), "NIO")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add item form */}
        {showAdd && (
          <div className="border-t border-border px-4 py-2">
            <AddItemForm debt={debt} onAdd={onAddItem} onAddProduct={onAddProduct} />
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 border-t border-border px-4 py-2">
          <button onClick={() => setShowAdd((v) => !v)}
            className={cn("flex items-center gap-1.5 text-xs transition-colors",
              showAdd ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
            <Plus className="h-3.5 w-3.5" />
            {showAdd ? "Cancelar" : "Agregar al fiado"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Credit balance card ───────────────────────────────────────────────────────
function CreditBalanceCard({ account }: { account: Account }) {
  const Icon = getAccountIcon(account.type);
  const balance = account.credit_balance ?? 0;
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${account.color}22` }}>
          <Icon className="h-4 w-4" style={{ color: account.color }} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{account.name}</p>
          <p className="text-xs text-muted-foreground">{ACCOUNT_TYPE_LABELS[account.type]} · Crédito</p>
        </div>
        <div className="text-right">
          {balance > 0 ? (
            <><p className="text-sm font-semibold text-destructive">{formatCurrency(balance, "NIO")}</p>
              <p className="text-xs text-muted-foreground">acumulado</p></>
          ) : (
            <p className="text-xs text-income font-medium">Sin deuda</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DebtsPage() {
  const { debts, loading, refetch, addItem, toggleItem, updateItem, deleteItem, settleDebt, deleteDebt, toggleSaved, addProduct, deleteProduct, updateProduct } = useDebts();
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const [newDebtOpen, setNewDebtOpen] = useState(false);
  const [newDebtName, setNewDebtName] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const [settleTarget, setSettleTarget] = useState<Debt | null>(null);
  const [catalogTarget, setCatalogTarget] = useState<Debt | null>(null);

  const creditAccounts = accounts.filter((a) => a.nature === "credit");
  // Saved debts always stay in active section (even when fully paid)
  const activeDebts = debts.filter((d) => {
    if (d.is_saved) return true;
    const items = d.debt_items ?? [];
    return items.length === 0 || items.some((i) => !i.is_paid);
  });
  const settledDebts = debts.filter((d) => {
    if (d.is_saved) return false;
    const items = d.debt_items ?? [];
    return items.length > 0 && items.every((i) => i.is_paid);
  });
  const [showSettled, setShowSettled] = useState(false);

  async function createDebt() {
    if (!newDebtName.trim()) { toast.error("Escribe un nombre"); return; }
    setSavingNew(true);
    const res = await fetch("/api/debts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creditor_name: newDebtName.trim() }),
    });
    setSavingNew(false);
    if (res.ok) { toast.success("Deuda creada"); setNewDebtName(""); setNewDebtOpen(false); refetch(); }
    else toast.error("Error al crear");
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Por pagar"
        subtitle="Fiado, tarjetas y deudas pendientes"
        action={
          <Button size="icon" aria-label="Nueva deuda" onClick={() => setNewDebtOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        }
      />

      {creditAccounts.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5" /> Tarjetas de crédito
          </h2>
          <div className="space-y-2">{creditAccounts.map((a) => <CreditBalanceCard key={a.id} account={a} />)}</div>
          <p className="text-xs text-muted-foreground px-1">
            Gasto acumulado desde tus transacciones. Para liquidar, registra el pago como transacción con categoría "Pago de tarjetas".
          </p>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <HandCoins className="h-3.5 w-3.5" /> Deudas manuales
        </h2>
        {loading ? <RowsSkeleton /> : activeDebts.length === 0 ? (
          <EmptyState icon={HandCoins} title="Sin deudas pendientes"
            description="Agrega las cuentas que tienes fiadas o cualquier deuda manual." />
        ) : (
          <div className="space-y-3">
            {activeDebts.map((d) => (
              <DebtCard key={d.id} debt={d}
                onToggleItem={(item) => toggleItem(d.id, item)}
                onDeleteItem={(itemId) => deleteItem(d.id, itemId)}
                onUpdateItem={(itemId, body) => updateItem(d.id, itemId, body)}
                onAddItem={(desc, amount, date) => addItem(d.id, { description: desc, amount, item_date: date })}
                onDeleteDebt={() => deleteDebt(d.id)}
                onSettle={() => setSettleTarget(d)}
                onOpenCatalog={() => setCatalogTarget(d)}
                onAddProduct={(name, price, unit) => addProduct(d.id, { name, unit_price: price, unit })}
                onToggleSaved={() => toggleSaved(d.id)}
              />
            ))}
          </div>
        )}
      </section>

      {settledDebts.length > 0 && (
        <section>
          <button onClick={() => setShowSettled((v) => !v)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            {showSettled ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            <TrendingDown className="h-3.5 w-3.5" />
            {settledDebts.length} deuda{settledDebts.length !== 1 ? "s" : ""} saldada{settledDebts.length !== 1 ? "s" : ""}
          </button>
          {showSettled && (
            <div className="mt-2 space-y-2">
              {settledDebts.map((d) => (
                <DebtCard key={d.id} debt={d}
                  onToggleItem={(item) => toggleItem(d.id, item)}
                  onDeleteItem={(itemId) => deleteItem(d.id, itemId)}
                  onUpdateItem={(itemId, body) => updateItem(d.id, itemId, body)}
                  onAddItem={(desc, amount, date) => addItem(d.id, { description: desc, amount, item_date: date })}
                  onDeleteDebt={() => deleteDebt(d.id)}
                  onSettle={() => setSettleTarget(d)}
                  onOpenCatalog={() => setCatalogTarget(d)}
                  onAddProduct={(name, price, unit) => addProduct(d.id, { name, unit_price: price, unit })}
                  onToggleSaved={() => toggleSaved(d.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <AppSheet open={newDebtOpen} onOpenChange={setNewDebtOpen} title="Nueva deuda">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>¿A quién le debes?</Label>
            <Input placeholder="Ej. Pulpería tía María, Farmacia El Sol…"
              value={newDebtName} onChange={(e) => setNewDebtName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createDebt()} />
          </div>
          <Button className="w-full" onClick={createDebt} disabled={savingNew || !newDebtName.trim()}>
            {savingNew ? "Creando…" : "Crear"}
          </Button>
        </div>
      </AppSheet>

      {catalogTarget && (
        <CatalogSheet
          debt={catalogTarget} open={!!catalogTarget} onClose={() => setCatalogTarget(null)}
          onAddProduct={(name, unit_price, unit) => addProduct(catalogTarget.id, { name, unit_price, unit })}
          onDeleteProduct={(id) => deleteProduct(catalogTarget.id, id)}
          onUpdateProduct={(id, body) => updateProduct(catalogTarget.id, id, body)}
        />
      )}

      <SettleSheet
        debt={settleTarget} open={!!settleTarget} onClose={() => setSettleTarget(null)}
        accounts={accounts} categories={categories}
        onSettle={async (opts) => {
          if (!settleTarget) return;
          await settleDebt(settleTarget.id, opts);
          const msgs: Record<PayMode, string> = {
            settle: `Pago total a ${settleTarget.creditor_name} registrado`,
            settle_items: `Productos pagados — transacción registrada`,
            settle_partial: `Abono registrado — quedó el restante pendiente`,
          };
          toast.success(msgs[opts.action]);
          setSettleTarget(null);
        }}
      />
    </div>
  );
}

