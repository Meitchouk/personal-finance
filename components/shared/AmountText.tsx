"use client";
import { usePreferences } from "@/components/providers/PreferencesProvider";
import { TRANSACTION_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/lib/types";

interface Props {
  amount: number;
  type: TransactionType;
  /** Show the +/- sign prefix. */
  signed?: boolean;
  className?: string;
}

/** Currency-formatted amount, colored by income/expense, using the user's currency. */
export default function AmountText({ amount, type, signed = true, className }: Props) {
  const { formatMoney } = usePreferences();
  return (
    <span
      className={cn(
        "font-semibold tabular-nums",
        type === "income" ? "text-income" : "text-expense",
        className
      )}
    >
      {signed ? TRANSACTION_TYPES[type].sign : ""}
      {formatMoney(amount)}
    </span>
  );
}
