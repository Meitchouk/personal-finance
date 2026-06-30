"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Tag, Target, BarChart3, Wallet, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transacciones", icon: ArrowLeftRight },
  { href: "/categories", label: "Categorías", icon: Tag },
  { href: "/budgets", label: "Presupuesto", icon: Target },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
];

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 px-4 py-6">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="bg-emerald-500 text-white p-2 rounded-xl">
          <Wallet className="h-5 w-5" />
        </div>
        <span className="font-bold text-lg">FinanzasApp</span>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t pt-4 mt-4">
        <p className="text-xs text-gray-500 px-3 mb-2 truncate">{user.email}</p>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 w-full"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
