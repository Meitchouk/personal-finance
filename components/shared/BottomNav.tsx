"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="flex border-t border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      {PRIMARY_NAV.map(({ href, shortLabel, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 pt-3 pb-1 text-xs font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <span className={cn(
              "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
              active && "bg-primary/10"
            )}>
              <Icon className={cn("h-[22px] w-[22px]", active && "scale-110 transition-transform")} />
            </span>
            <span className="text-[11px] leading-none">{shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
