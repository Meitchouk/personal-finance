import { Transaction } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const DRIVE_BASE = "https://www.googleapis.com/drive/v3";

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export interface SpreadsheetItem {
  id: string;
  name: string;
  modifiedTime: string;
}

export async function listSpreadsheets(token: string): Promise<SpreadsheetItem[]> {
  const q = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const res = await fetch(
    `${DRIVE_BASE}/files?q=${q}&orderBy=modifiedTime+desc&pageSize=20&fields=files(id,name,modifiedTime)`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) throw new Error("No se pudieron listar los spreadsheets");
  const data = await res.json();
  return data.files ?? [];
}

export async function createSpreadsheet(token: string, title: string): Promise<string> {
  const res = await fetch(SHEETS_BASE, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ properties: { title } }),
  });
  if (!res.ok) throw new Error("No se pudo crear el spreadsheet");
  const data = await res.json();
  return data.spreadsheetId;
}

export async function getSheetsList(token: string, spreadsheetId: string): Promise<{ sheetId: number; title: string }[]> {
  const res = await fetch(`${SHEETS_BASE}/${spreadsheetId}?fields=sheets.properties`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("No se pudo obtener las hojas");
  const data = await res.json();
  return (data.sheets ?? []).map((s: { properties: { sheetId: number; title: string } }) => ({
    sheetId: s.properties.sheetId,
    title: s.properties.title,
  }));
}

async function ensureSheet(token: string, spreadsheetId: string, sheetTitle: string): Promise<void> {
  const sheets = await getSheetsList(token, spreadsheetId);
  const exists = sheets.some((s) => s.title === sheetTitle);
  if (!exists) {
    await fetch(`${SHEETS_BASE}/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title: sheetTitle } } }],
      }),
    });
  }
}

async function clearSheet(token: string, spreadsheetId: string, sheetTitle: string): Promise<void> {
  const range = encodeURIComponent(`${sheetTitle}!A1:Z10000`);
  await fetch(`${SHEETS_BASE}/${spreadsheetId}/values/${range}:clear`, {
    method: "POST",
    headers: authHeaders(token),
  });
}

function transactionsToRows(transactions: Transaction[]): (string | number)[][] {
  const header = ["Fecha", "Descripción", "Categoría", "Tipo", "Monto"];
  const rows = transactions.map((t) => [
    t.date,
    t.description,
    t.categories?.name ?? "Sin categoría",
    t.type === "income" ? "Ingreso" : "Gasto",
    t.type === "expense" ? -t.amount : t.amount,
  ]);
  return [header, ...rows];
}

export async function writeTransactionsToSheet(
  token: string,
  spreadsheetId: string,
  transactions: Transaction[],
  sheetTitle: string
): Promise<void> {
  await ensureSheet(token, spreadsheetId, sheetTitle);
  await clearSheet(token, spreadsheetId, sheetTitle);

  const values = transactionsToRows(transactions);
  const range = encodeURIComponent(`${sheetTitle}!A1`);

  await fetch(`${SHEETS_BASE}/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ values }),
  });

  // Bold the header row
  const sheets = await getSheetsList(token, spreadsheetId);
  const sheet = sheets.find((s) => s.title === sheetTitle);
  if (sheet) {
    await fetch(`${SHEETS_BASE}/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: { sheetId: sheet.sheetId, startRowIndex: 0, endRowIndex: 1 },
              cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.063, green: 0.725, blue: 0.506 } } },
              fields: "userEnteredFormat(textFormat,backgroundColor)",
            },
          },
          {
            autoResizeDimensions: {
              dimensions: { sheetId: sheet.sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 5 },
            },
          },
        ],
      }),
    });
  }
}

export function getMonthSheetTitle(date?: Date): string {
  return format(date ?? new Date(), "MMMM yyyy", { locale: es }).replace(/^\w/, (c) => c.toUpperCase());
}

export function getSpreadsheetUrl(id: string): string {
  return `https://docs.google.com/spreadsheets/d/${id}`;
}
