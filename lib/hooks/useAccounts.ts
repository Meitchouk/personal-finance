"use client";
import { useEffect, useState, useCallback } from "react";
import type { Account } from "@/lib/types";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    const res = await window.fetch("/api/accounts");
    if (res.ok) {
      const { data } = await res.json();
      setAccounts((data as Account[]) ?? []);
    } else {
      setAccounts([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  return { accounts, loading, refetch: fetchAccounts };
}
