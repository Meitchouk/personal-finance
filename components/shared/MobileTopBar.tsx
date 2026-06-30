"use client";
import Link from "next/link";
import { Wallet, Settings } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";

export default function MobileTopBar() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wallet className="h-4 w-4" />
        </div>
        <span className="font-bold tracking-tight">FinanzasApp</span>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/settings"
          aria-label="Ajustes"
          className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
        >
          <Settings className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
