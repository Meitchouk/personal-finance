import CategoryIcon from "@/components/shared/CategoryIcon";
import AmountText from "@/components/shared/AmountText";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { Repeat } from "lucide-react";
import type { Transaction } from "@/lib/types";

interface Props {
  transaction: Transaction;
  /** Optional trailing actions (e.g. a dropdown menu). */
  actions?: React.ReactNode;
  /** Compact variant for dense lists like the dashboard. */
  compact?: boolean;
}

export default function TransactionRow({ transaction: t, actions, compact }: Props) {
  return (
    <div className="flex items-center gap-3">
      <CategoryIcon category={t.categories} size={compact ? "sm" : "md"} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{t.description}</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
          {t.categories && (
            <Badge
              variant="outline"
              className="h-4 px-1.5 py-0 text-[10px]"
              style={{ color: t.categories.color, borderColor: t.categories.color }}
            >
              {t.categories.name}
            </Badge>
          )}
          {t.is_recurring && <Repeat className="h-3 w-3 text-muted-foreground" />}
        </div>
      </div>
      <AmountText amount={t.amount} type={t.type} className="text-sm" />
      {actions}
    </div>
  );
}
