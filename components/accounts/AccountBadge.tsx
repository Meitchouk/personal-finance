import { Landmark, CreditCard, Wallet, Smartphone, Package } from "lucide-react";
import type { Account, AccountNature, AccountType } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<AccountType, typeof Wallet> = {
  bank: Landmark,
  card: CreditCard,
  cash: Wallet,
  digital: Smartphone,
  other: Package,
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  bank: "Banco",
  card: "Tarjeta",
  cash: "Efectivo",
  digital: "Monedero digital",
  other: "Otro",
};

export const ACCOUNT_NATURE_LABELS: Record<AccountNature, string> = {
  debit: "Débito",
  credit: "Crédito",
};

export function getAccountIcon(type: AccountType) {
  return TYPE_ICONS[type] ?? Package;
}

interface Props {
  account: Account | null | undefined;
  className?: string;
}

export default function AccountBadge({ account, className }: Props) {
  if (!account) return null;
  const Icon = getAccountIcon(account.type);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
        className
      )}
      style={{ backgroundColor: `${account.color}18`, color: account.color }}
    >
      <Icon className="h-2.5 w-2.5 shrink-0" />
      {account.name}
    </span>
  );
}
