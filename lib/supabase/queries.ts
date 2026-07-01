import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { BASE_CURRENCY } from "@/lib/currency";
import { DEFAULT_CURRENCY, isCurrencyCode, type CurrencyCode } from "@/lib/format";
import type { Profile, Transaction, Debt } from "@/lib/types";

export interface Preferences {
  currency: CurrencyCode;
  displayName: string | null;
  /**
   * Conversion rate from the base currency (NIO) to the user's preferred
   * display currency. Always 1 when the user's currency IS the base currency.
   * All stored `amount` values are in NIO — multiply by this to display correctly.
   */
  exchangeRate: number;
}

/** Authenticated user for the current request (cached). */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Current user's profile row (cached per request). */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return (data as Profile) ?? null;
});

/** User preferences with safe defaults (cached per request). */
export const getPreferences = cache(async (): Promise<Preferences> => {
  const profile = await getProfile();
  const currency = isCurrencyCode(profile?.currency) ? profile!.currency : DEFAULT_CURRENCY;

  // Fetch the NIO → user-currency rate so the client can convert stored amounts.
  let exchangeRate = 1;
  if (currency !== BASE_CURRENCY) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("exchange_rates")
      .select("rate")
      .eq("source_currency", BASE_CURRENCY)
      .eq("target_currency", currency)
      .eq("is_active", true)
      .single();
    if (data?.rate) exchangeRate = Number(data.rate);
  }

  return {
    currency,
    displayName: profile?.display_name ?? null,
    exchangeRate,
  };
});

/** Transactions (with joined category) for an inclusive date range. */
export async function getTransactionsBetween(
  from: string,
  to: string
): Promise<Transaction[]> {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("transactions")
    .select("*, categories(*)")
    .eq("user_id", user.id)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: false });
  return (data as Transaction[]) ?? [];
}

/**
 * Active debts with their unpaid items for the current user.
 * A debt is "active" if it is saved OR has at least one unpaid item.
 * Used by the dashboard to conditionally show the debt quick-action.
 */
export async function getActiveDebts(): Promise<Debt[]> {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("debts")
    .select("*, debt_items(*), debt_products(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const all = (data as Debt[]) ?? [];
  return all.filter((d) => {
    if (d.is_saved) return true;
    const items = d.debt_items ?? [];
    return items.length === 0 || items.some((i) => !i.is_paid);
  });
}
