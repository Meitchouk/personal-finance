"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/components/providers/PreferencesProvider";
import { createClient } from "@/lib/supabase/client";
import { CURRENCIES, type CurrencyCode } from "@/lib/format";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Sun, Moon, Monitor, LogOut } from "lucide-react";

const THEMES = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

export default function SettingsPage() {
  const { currency, displayName, setCurrency, setDisplayName } = usePreferences();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState(displayName ?? "");
  const [email, setEmail] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    createClient().auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  async function saveName() {
    setSavingName(true);
    await setDisplayName(name.trim());
    setSavingName(false);
    toast.success("Nombre actualizado");
  }

  async function changeCurrency(value: CurrencyCode | null) {
    if (!value) return;
    await setCurrency(value);
    toast.success("Moneda actualizada");
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Ajustes" subtitle={email} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <div className="flex gap-2">
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
              <Button onClick={saveName} disabled={savingName || name.trim() === (displayName ?? "")}>
                Guardar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Moneda</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={currency} onValueChange={changeCurrency}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(CURRENCIES).map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map(({ value, label, icon: Icon }) => {
              const active = mounted && theme === value;
              return (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border py-3 text-sm transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" onClick={signOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar sesión
      </Button>
    </div>
  );
}
