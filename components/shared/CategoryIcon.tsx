import { getCategoryIcon } from "@/lib/icons";
import { hexToRgba, cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

const SIZES = {
  sm: { box: "h-9 w-9", icon: "h-4 w-4" },
  md: { box: "h-10 w-10", icon: "h-5 w-5" },
  lg: { box: "h-12 w-12", icon: "h-6 w-6" },
};

interface Props {
  /** A category, or an explicit icon key + color. */
  category?: Pick<Category, "icon" | "color"> | null;
  iconKey?: string;
  color?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

/** Circular tinted badge rendering a category's lucide icon. */
export default function CategoryIcon({ category, iconKey, color, size = "md", className }: Props) {
  const key = category?.icon ?? iconKey;
  const c = category?.color ?? color ?? "#64748b";
  const Icon = getCategoryIcon(key);
  const s = SIZES[size];

  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full", s.box, className)}
      style={{ backgroundColor: hexToRgba(c, 0.14), color: c }}
    >
      <Icon className={s.icon} />
    </div>
  );
}
