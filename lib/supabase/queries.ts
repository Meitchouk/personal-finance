import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CURRENCY, isCurrencyCode, type CurrencyCode } from "@/lib/format";
import type { Profile, Transaction } from "@/lib/types";

export interface Preferences {
  currency: CurrencyCode;
  displayName: string | null;
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
  return {
    currency: isCurrencyCode(profile?.currency) ? profile!.currency : DEFAULT_CURRENCY,
    displayName: profile?.display_name ?? null,
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
