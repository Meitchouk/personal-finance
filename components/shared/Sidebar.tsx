"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wallet, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/lib/nav";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const items = [...PRIMARY_NAV, ...SECONDARY_NAV];

  return (
    <div className="flex h-full flex-col border-r border-border bg-sidebar px-3 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Wallet className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight">FinanzasApp</span>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between px-1">
          <span className="truncate text-xs text-muted-foreground">{email}</span>
          <ThemeToggle />
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
