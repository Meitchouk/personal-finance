"use client";
import { CATEGORY_ICONS } from "@/lib/icons";
import { cn, hexToRgba } from "@/lib/utils";

interface Props {
  value: string;
  color: string;
  onChange: (key: string) => void;
}

export default function IconPicker({ value, color, onChange }: Props) {
  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
      {CATEGORY_ICONS.map(({ key, label, Icon }) => {
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={selected}
            onClick={() => onChange(key)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-xl border transition-all",
              selected
                ? "border-transparent ring-2 ring-offset-1 ring-offset-background"
                : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
            style={
              selected
                ? { backgroundColor: hexToRgba(color, 0.16), color, boxShadow: `0 0 0 2px ${color}` }
                : undefined
            }
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
}
