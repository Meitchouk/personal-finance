"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { authDebugLog } from "@/lib/auth-debug";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Wallet, MailCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Surface auth errors returned by the OAuth callback.
  useEffect(() => {
    const supabase = createClient();
    const error = new URLSearchParams(window.location.search).get("error");
    authDebugLog(window.location.host, "login", "mounted", {
      href: window.location.href,
      origin: window.location.origin,
      callbackUrl: getAuthCallbackUrl(),
      error: error ?? null,
    });

    supabase.auth.getSession().then(({ data, error }) => {
      authDebugLog(window.location.host, "login", "session-check", {
        hasSession: Boolean(data.session),
        userIdPrefix: data.session?.user.id.slice(0, 8) ?? null,
        error: error?.message ?? null,
      });
    });

    if (error) {
      toast.error(error === "auth" ? "Falló el inicio de sesión" : error);
      window.history.replaceState(null, "", "/login");
    }
  }, []);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const callbackUrl = getAuthCallbackUrl();

    authDebugLog(window.location.host, "login", "magic-link-start", {
      callbackUrl,
      hasEmail: Boolean(email),
    });

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl },
    });
    setLoading(false);
    if (error) {
      authDebugLog(window.location.host, "login", "magic-link-error", {
        message: error.message,
        status: error.status ?? null,
      });
      toast.error(error.message);
    } else {
      authDebugLog(window.location.host, "login", "magic-link-sent");
      setSent(true);
    }
  }

  async function handleGoogle() {
    const supabase = createClient();
    const callbackUrl = getAuthCallbackUrl();

    authDebugLog(window.location.host, "login", "google-start", {
      callbackUrl,
      scopes: "default-profile-email",
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });

    authDebugLog(window.location.host, "login", "google-result", {
      providerRedirectUrl: data.url ? new URL(data.url).origin : null,
      hasError: Boolean(error),
      error: error?.message ?? null,
    });

    if (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4 dark:from-slate-900 dark:to-slate-950">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Wallet className="h-7 w-7" />
            </div>
          </div>
          <CardTitle className="text-2xl">FinanzasApp</CardTitle>
          <CardDescription>Tu gestor personal de gastos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <MailCheck className="h-10 w-10 text-primary" />
              <p className="text-sm text-muted-foreground">
                Revisa tu correo. Te enviamos un enlace para iniciar sesión.
              </p>
            </div>
          ) : (
            <>
              <Button variant="outline" size="lg" className="w-full" onClick={handleGoogle}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuar con Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">o</span>
                </div>
              </div>
              <form onSubmit={handleMagicLink} className="space-y-3">
                <div className="space-y-1.5" suppressHydrationWarning>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar enlace mágico"}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
