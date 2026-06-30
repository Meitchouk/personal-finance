"use client";

import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  size?: "default" | "wide";
  className?: string;
  contentClassName?: string;
}

const SIZE_CLASS = {
  default: "md:w-[min(32rem,calc(100vw-2rem))]",
  wide: "md:w-[min(52rem,calc(100vw-2rem))]",
};

export default function AppSheet({
  open,
  onOpenChange,
  title,
  children,
  size = "default",
  className,
  contentClassName,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "h-full w-full overflow-x-hidden overflow-y-auto",
          SIZE_CLASS[size],
          className
        )}
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className={cn("px-4 pb-6 pt-4", contentClassName)}>{children}</div>
      </SheetContent>
    </Sheet>
  );
}
