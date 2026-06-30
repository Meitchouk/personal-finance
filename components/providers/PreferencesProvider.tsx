"use client";
import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { formatCurrency, type CurrencyCode } from "@/lib/format";
import type { Preferences } from "@/lib/supabase/queries";

interface PreferencesContextValue extends Preferences {
  formatMoney: (amount: number) => string;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
  setDisplayName: (name: string) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({
  initial,
  children,
}: {
  initial: Preferences;
  children: React.ReactNode;
}) {
  const [prefs, setPrefs] = useState<Preferences>(initial);

  const persist = useCallback(async (patch: Partial<Preferences>) => {
    setPrefs((p) => ({ ...p, ...patch }));
    // Map camelCase preferences to snake_case DB columns.
    const dbPatch: Record<string, unknown> = {};
    if (patch.currency !== undefined) dbPatch.currency = patch.currency;
    if (patch.displayName !== undefined) dbPatch.display_name = patch.displayName;
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dbPatch),
    });
  }, []);

  const setCurrency = useCallback((currency: CurrencyCode) => persist({ currency }), [persist]);
  const setDisplayName = useCallback((displayName: string) => persist({ displayName }), [persist]);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      ...prefs,
      formatMoney: (amount: number) => formatCurrency(amount, prefs.currency),
      setCurrency,
      setDisplayName,
    }),
    [prefs, setCurrency, setDisplayName]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
