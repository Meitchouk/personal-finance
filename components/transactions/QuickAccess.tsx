"use client";
import { getCategoryIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TransactionTemplate } from "@/lib/types";
import { TrendingDown, TrendingUp, X, Zap } from "lucide-react";

interface Props {
  templates: TransactionTemplate[];
  onUse: (template: TransactionTemplate) => void;
  onDelete: (id: string) => void;
}

export default function QuickAccess({ templates, onUse, onDelete }: Props) {
  if (templates.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Zap className="h-3 w-3" />
        Accesos rápidos
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {templates.map((t) => {
          const isExpense = t.type === "expense";
          const Icon = isExpense ? TrendingDown : TrendingUp;
          const CatIcon = t.categories ? getCategoryIcon(t.categories.icon) : null;
          const color = t.categories?.color ?? (isExpense ? "#ef4444" : "#22c55e");

          return (
            <div
              key={t.id}
              className="group relative flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm transition-colors hover:bg-muted/50 active:scale-95"
              onClick={() => onUse(t)}
            >
              {/* Category icon or type icon */}
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${color}22` }}
              >
                {CatIcon ? (
                  <CatIcon className="h-3.5 w-3.5" style={{ color }} />
                ) : (
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                )}
              </span>

              <div className="min-w-0">
                <p className="max-w-[10rem] truncate text-xs font-medium leading-tight">
                  {t.description}
                </p>
                <p
                  className={cn(
                    "text-xs font-semibold leading-tight",
                    isExpense ? "text-expense" : "text-income"
                  )}
                >
                  {isExpense ? "-" : "+"}{formatCurrency(t.original_amount, t.original_currency)}
                </p>
              </div>

              {/* Delete button */}
              <button
                type="button"
                aria-label="Eliminar acceso rápido"
                onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
