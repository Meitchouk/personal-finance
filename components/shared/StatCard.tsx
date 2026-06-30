import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Tone = "income" | "expense" | "neutral";

const TONES: Record<Tone, string> = {
  income: "text-income",
  expense: "text-expense",
  neutral: "text-foreground",
};

interface Props {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: Tone;
}

export default function StatCard({ label, value, icon: Icon, tone = "neutral" }: Props) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-3">
        <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
          <Icon className={cn("h-3.5 w-3.5", TONES[tone])} />
          <span className="text-xs">{label}</span>
        </div>
        <p className={cn("text-sm font-bold tabular-nums sm:text-base", TONES[tone])}>{value}</p>
      </CardContent>
    </Card>
  );
}
