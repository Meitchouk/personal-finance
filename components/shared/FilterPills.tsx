"use client";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface PillOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  activeClass?: string;
}

interface Props {
  options: PillOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function FilterPills({ options, value, onChange, className }: Props) {
  return (
    <div className={cn("flex gap-1 rounded-xl bg-muted p-1", className)}>
      {options.map((option) => {
        const active = value === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              active
                ? cn("bg-card shadow-sm", option.activeClass ?? "text-foreground")
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
