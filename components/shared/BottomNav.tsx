"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="flex border-t border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
      {PRIMARY_NAV.map(({ href, shortLabel, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5", active && "scale-110 transition-transform")} />
            <span>{shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
