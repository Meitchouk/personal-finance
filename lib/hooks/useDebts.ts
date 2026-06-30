"use client";
import { useCallback, useEffect, useState } from "react";
import type { Debt, DebtItem, DebtProduct } from "@/lib/types";

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/debts");
    if (res.ok) {
      const { data } = await res.json();
      setDebts((data as Debt[]) ?? []);
    } else {
      setDebts([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDebts(); }, [fetchDebts]);

  function updateLocal(id: string, updater: (d: Debt) => Debt) {
    setDebts((prev) => prev.map((d) => (d.id === id ? updater(d) : d)));
  }

  function patchItemLocal(debtId: string, itemId: string, updater: (i: DebtItem) => DebtItem) {
    updateLocal(debtId, (d) => ({
      ...d,
      debt_items: (d.debt_items ?? []).map((i) => (i.id === itemId ? updater(i) : i)),
    }));
  }

  async function addItem(debtId: string, body: { description: string; amount: number; item_date: string }) {
    const res = await fetch(`/api/debts/${debtId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const { data } = await res.json();
    updateLocal(debtId, (d) => ({ ...d, debt_items: [...(d.debt_items ?? []), data as DebtItem] }));
    return data as DebtItem;
  }

  async function toggleItem(debtId: string, item: DebtItem) {
    const next = !item.is_paid;
    patchItemLocal(debtId, item.id, (i) => ({ ...i, is_paid: next, paid_at: next ? new Date().toISOString() : null }));
    await fetch(`/api/debts/${debtId}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_paid: next }),
    });
  }

  async function updateItem(debtId: string, itemId: string, body: { description?: string; amount?: number; quantity?: number; unit_price?: number }) {
    const res = await fetch(`/api/debts/${debtId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const { data } = await res.json();
    patchItemLocal(debtId, itemId, () => data as DebtItem);
  }

  async function deleteItem(debtId: string, itemId: string) {
    updateLocal(debtId, (d) => ({ ...d, debt_items: (d.debt_items ?? []).filter((i) => i.id !== itemId) }));
    await fetch(`/api/debts/${debtId}/items/${itemId}`, { method: "DELETE" });
  }

  async function settleDebt(
    debtId: string,
    opts: {
      action: "settle" | "settle_items" | "settle_partial";
      item_ids?: string[];
      paid_amount?: number;
      account_id?: string;
      category_id?: string;
      date: string;
      currency?: string;
      description?: string;
    }
  ) {
    const res = await fetch(`/api/debts/${debtId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    // Refetch for accuracy (partial creates new items server-side)
    await fetchDebts();
  }

  async function toggleSaved(id: string) {
    const debt = debts.find((d) => d.id === id);
    if (!debt) return;
    const next = !debt.is_saved;
    updateLocal(id, (d) => ({ ...d, is_saved: next }));
    await fetch(`/api/debts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_saved: next }),
    });
  }

  async function deleteDebt(id: string) {
    await fetch(`/api/debts/${id}`, { method: "DELETE" });
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }

  async function addProduct(debtId: string, body: { name: string; unit_price: number; unit?: string }) {
    const res = await fetch(`/api/debts/${debtId}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const { data } = await res.json();
    updateLocal(debtId, (d) => ({ ...d, debt_products: [...(d.debt_products ?? []), data as DebtProduct] }));
    return data as DebtProduct;
  }

  async function deleteProduct(debtId: string, productId: string) {
    updateLocal(debtId, (d) => ({ ...d, debt_products: (d.debt_products ?? []).filter((p) => p.id !== productId) }));
    await fetch(`/api/debts/${debtId}/products/${productId}`, { method: "DELETE" });
  }

  async function updateProduct(debtId: string, productId: string, body: { name?: string; unit_price?: number; unit?: string }) {
    const res = await fetch(`/api/debts/${debtId}/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const { data } = await res.json();
    updateLocal(debtId, (d) => ({
      ...d,
      debt_products: (d.debt_products ?? []).map((p) => (p.id === productId ? (data as DebtProduct) : p)),
    }));
  }

  return { debts, loading, refetch: fetchDebts, addItem, toggleItem, updateItem, deleteItem, settleDebt, deleteDebt, toggleSaved, addProduct, deleteProduct, updateProduct };
}
