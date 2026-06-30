"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Tag, Target, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/transactions", label: "Gastos", icon: ArrowLeftRight },
  { href: "/categories", label: "Categorías", icon: Tag },
  { href: "/budgets", label: "Presupuesto", icon: Target },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bg-white border-t border-gray-200 flex">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
              active ? "text-emerald-600" : "text-gray-500"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
