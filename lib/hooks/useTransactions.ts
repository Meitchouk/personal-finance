"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Transaction, TransactionFilters } from "@/lib/types";

export function useTransactions(filters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("transactions")
      .select("*, categories(*)")
      .order("date", { ascending: false });

    if (filters?.type && filters.type !== "all") query = query.eq("type", filters.type);
    if (filters?.category_id) query = query.eq("category_id", filters.category_id);
    if (filters?.date_from) query = query.gte("date", filters.date_from);
    if (filters?.date_to) query = query.lte("date", filters.date_to);
    if (filters?.search) query = query.ilike("description", `%${filters.search}%`);

    const { data } = await query;
    setTransactions((data as Transaction[]) ?? []);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  return { transactions, loading, refetch: fetch };
}
