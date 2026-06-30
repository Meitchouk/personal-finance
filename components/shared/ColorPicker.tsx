"use client";
import { CATEGORY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
      {CATEGORY_COLORS.map((color) => {
        const selected = value.toLowerCase() === color.toLowerCase();
        return (
          <button
            key={color}
            type="button"
            aria-label={color}
            aria-pressed={selected}
            onClick={() => onChange(color)}
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-transform",
              selected && "scale-110 ring-2 ring-offset-2 ring-offset-background ring-foreground/30"
            )}
            style={{ backgroundColor: color }}
          >
            {selected && <Check className="h-4 w-4 text-white" />}
          </button>
        );
      })}
    </div>
  );
}
