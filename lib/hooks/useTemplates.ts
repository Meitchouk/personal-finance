"use client";
import { useCallback, useEffect, useState } from "react";
import type { TransactionTemplate } from "@/lib/types";

export function useTemplates() {
  const [templates, setTemplates] = useState<TransactionTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/templates");
    if (res.ok) {
      const { data } = await res.json();
      setTemplates((data as TransactionTemplate[]) ?? []);
    } else {
      setTemplates([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  async function deleteTemplate(id: string) {
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  return { templates, loading, refetch: fetchTemplates, deleteTemplate };
}
