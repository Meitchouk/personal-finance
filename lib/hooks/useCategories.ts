"use client";
import { useEffect, useState, useCallback } from "react";
import { Category } from "@/lib/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const res = await window.fetch("/api/categories");
    if (res.ok) {
      const { data } = await res.json();
      setCategories((data as Category[]) ?? []);
    } else {
      setCategories([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { categories, loading, refetch: fetch };
}
