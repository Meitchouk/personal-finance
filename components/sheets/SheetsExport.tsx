"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  listSpreadsheets,
  createSpreadsheet,
  writeTransactionsToSheet,
  getMonthSheetTitle,
  getSpreadsheetUrl,
  SpreadsheetItem,
} from "@/lib/google-sheets";
import { Transaction, TransactionFilters } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { ExternalLink, FileSpreadsheet, Plus, Search, RefreshCw, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  open: boolean;
  onClose: () => void;
  filters?: TransactionFilters;
}

type Step = "pick" | "month" | "exporting" | "done";

export default function SheetsExport({ open, onClose, filters }: Props) {
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSheet, setSelectedSheet] = useState<SpreadsheetItem | null>(null);
  const [savedSheetId, setSavedSheetId] = useState<string | null>(null);
  const [savedSheetName, setSavedSheetName] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [step, setStep] = useState<Step>("pick");
  const [monthTitle, setMonthTitle] = useState(getMonthSheetTitle());
  const [resultUrl, setResultUrl] = useState("");
  const [noScopesError, setNoScopesError] = useState(false);

  const loadToken = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.provider_token ?? null;
    setProviderToken(token);

    // Load saved sheet from profile
    const res = await fetch("/api/profile");
    if (res.ok) {
      const { data } = await res.json();
      if (data?.google_sheet_id) {
        setSavedSheetId(data.google_sheet_id);
        setSavedSheetName(data.google_sheet_name ?? null);
      }
    }
    return token;
  }, []);

  const loadSpreadsheets = useCallback(async (token: string) => {
    setLoadingList(true);
    try {
      const list = await listSpreadsheets(token);
      setSpreadsheets(list);
    } catch {
      setNoScopesError(true);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setStep("pick");
    setSelectedSheet(null);
    setCreating(false);
    setNewName("");
    setNoScopesError(false);
    loadToken().then((token) => { if (token) loadSpreadsheets(token); else setNoScopesError(true); });
  }, [open, loadToken, loadSpreadsheets]);

  async function handleReauthGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  }

  async function handleCreateNew() {
    if (!providerToken || !newName.trim()) return;
    setLoadingList(true);
    try {
      const id = await createSpreadsheet(providerToken, newName.trim());
      setSelectedSheet({ id, name: newName.trim(), modifiedTime: new Date().toISOString() });
      setCreating(false);
      setStep("month");
    } catch {
      toast.error("No se pudo crear el spreadsheet");
    } finally {
      setLoadingList(false);
    }
  }

  async function handleExport() {
    const sheet = selectedSheet;
    if (!sheet || !providerToken) return;
    setStep("exporting");

    try {
      // Fetch transactions based on current filters
      const params = new URLSearchParams({ limit: "5000" });
      if (filters?.date_from) params.set("date_from", filters.date_from);
      if (filters?.date_to) params.set("date_to", filters.date_to);
      if (filters?.type && filters.type !== "all") params.set("type", filters.type);
      if (filters?.category_id) params.set("category_id", filters.category_id);
      if (filters?.search) params.set("search", filters.search);

      const res = await fetch(`/api/transactions?${params}`);
      const { data: transactions } = await res.json() as { data: Transaction[] };

      await writeTransactionsToSheet(providerToken, sheet.id, transactions ?? [], monthTitle);

      // Save sheet ID + name in profile for next time
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ google_sheet_id: sheet.id, google_sheet_name: sheet.name }),
      });
      setSavedSheetId(sheet.id);
      setSavedSheetName(sheet.name);

      setResultUrl(getSpreadsheetUrl(sheet.id));
      setStep("done");
    } catch (err) {
      console.error(err);
      toast.error("Error al exportar. Puede que el token haya expirado — vuelve a iniciar sesión con Google.");
      setStep("pick");
    }
  }

  const filtered = spreadsheets.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="h-auto max-h-[90vh] overflow-y-auto rounded-t-2xl pb-8">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Exportar a Google Sheets
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          {/* No scopes error */}
          {noScopesError && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Permisos adicionales necesarios</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Para exportar a Google Sheets necesitas volver a iniciar sesión con Google y aceptar el permiso de editar tus hojas de cálculo.
                  </p>
                </div>
              </div>
              <Button onClick={handleReauthGoogle} className="w-full bg-green-600 hover:bg-green-700">
                Conectar con Google Sheets
              </Button>
            </div>
          )}

          {/* Step: pick spreadsheet */}
          {!noScopesError && step === "pick" && (
            <div className="space-y-4">
              {/* Saved spreadsheet shortcut */}
              {savedSheetId && savedSheetName && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Último usado</p>
                  <button
                    onClick={() => { setSelectedSheet({ id: savedSheetId, name: savedSheetName, modifiedTime: "" }); setStep("month"); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-green-500 bg-green-50 text-left"
                  >
                    <FileSpreadsheet className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{savedSheetName}</p>
                      <p className="text-xs text-green-700">Usar este spreadsheet</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Create new */}
              {creating ? (
                <div className="space-y-2">
                  <Label>Nombre del nuevo spreadsheet</Label>
                  <Input
                    placeholder={`Finanzas ${new Date().getFullYear()}`}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateNew()}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setCreating(false)}>Cancelar</Button>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleCreateNew} disabled={!newName.trim() || loadingList}>
                      Crear
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" className="w-full border-dashed" onClick={() => { setCreating(true); setNewName(`Finanzas ${new Date().getFullYear()}`); }}>
                  <Plus className="h-4 w-4 mr-2" /> Crear nuevo spreadsheet
                </Button>
              )}

              {/* Search existing */}
              {!creating && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar spreadsheet..."
                      className="pl-9"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  {loadingList ? (
                    <div className="flex justify-center py-6">
                      <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : filtered.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground py-4">
                      {search ? "Sin resultados" : "No tienes spreadsheets aún"}
                    </p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {filtered.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => { setSelectedSheet(s); setStep("month"); }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left transition-colors"
                        >
                          <FileSpreadsheet className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{s.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {s.modifiedTime ? format(new Date(s.modifiedTime), "dd MMM yyyy", { locale: es }) : ""}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step: select month tab */}
          {step === "month" && selectedSheet && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium truncate">{selectedSheet.name}</p>
              </div>

              <div className="space-y-1">
                <Label>Nombre de la pestaña (mes)</Label>
                <Input
                  value={monthTitle}
                  onChange={(e) => setMonthTitle(e.target.value)}
                  placeholder="Junio 2026"
                />
                <p className="text-xs text-muted-foreground">
                  Si la pestaña ya existe, sus datos serán reemplazados.
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep("pick")}>Atrás</Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleExport}>
                  Exportar
                </Button>
              </div>
            </div>
          )}

          {/* Step: exporting */}
          {step === "exporting" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
              <p className="text-sm font-medium">Exportando a Google Sheets...</p>
            </div>
          )}

          {/* Step: done */}
          {step === "done" && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-semibold">¡Exportado con éxito!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Pestaña &quot;<strong>{monthTitle}</strong>&quot; actualizada
                </p>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => window.open(resultUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir en Google Sheets
              </Button>
              <Button variant="outline" className="w-full" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
