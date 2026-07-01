"use client";
import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { formatCurrency, type CurrencyCode } from "@/lib/format";
import { BASE_CURRENCY, DEFAULT_EXCHANGE_RATES } from "@/lib/currency";
import type { Preferences } from "@/lib/supabase/queries";

interface PreferencesContextValue extends Preferences {
  /**
   * Formats a stored amount (always in NIO / base currency) into the user's
   * preferred display currency, applying the exchange rate automatically.
   */
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

  const setCurrency = useCallback(
    async (currency: CurrencyCode) => {
      // Derive the exchange rate from the static defaults so we don't need a
      // network round-trip — the live rate from the DB was already applied on
      // the server; this just keeps the client in sync instantly.
      let exchangeRate = 1;
      if (currency !== BASE_CURRENCY) {
        const found = DEFAULT_EXCHANGE_RATES.find(
          (r) => r.source_currency === BASE_CURRENCY && r.target_currency === currency
        );
        exchangeRate = found?.rate ?? 1;
      }
      await persist({ currency, exchangeRate });
    },
    [persist]
  );

  const setDisplayName = useCallback(
    (displayName: string) => persist({ displayName }),
    [persist]
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({
      ...prefs,
      /**
       * Convert from base currency (NIO) to the user's preferred currency,
       * then format. All `amount` fields in the DB are stored in NIO.
       */
      formatMoney: (amount: number) =>
        formatCurrency(amount * prefs.exchangeRate, prefs.currency),
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
