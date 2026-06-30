"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

interface Props {
  value?: string;
  onChange: (value: string | undefined) => void;
  fromYear?: number;
  toYear?: number;
  compact?: boolean;
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function parseDate(value?: string) {
  const [year, month, day] = value?.split("-").map(Number) ?? [];
  const now = new Date();

  return {
    year: Number.isFinite(year) ? year : now.getFullYear(),
    month: Number.isFinite(month) ? month : now.getMonth() + 1,
    day: Number.isFinite(day) ? day : now.getDate(),
  };
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function buildDate(year: number, month: number, day: number) {
  const safeDay = Math.min(day, daysInMonth(year, month));
  return `${year}-${pad(month)}-${pad(safeDay)}`;
}

export default function DateSelectFields({
  value,
  onChange,
  fromYear = new Date().getFullYear() - 5,
  toYear = new Date().getFullYear() + 2,
  compact,
}: Props) {
  const parsed = parseDate(value);
  const days = daysInMonth(parsed.year, parsed.month);
  const years = Array.from({ length: toYear - fromYear + 1 }, (_, index) => fromYear + index);

  return (
    <div className={compact ? "grid grid-cols-[1fr_1.4fr_1.2fr] gap-2" : "grid grid-cols-[1fr_1.5fr_1.2fr] gap-2"}>
      <Select
        value={parsed.day.toString()}
        onValueChange={(day) => onChange(buildDate(parsed.year, parsed.month, Number(day)))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Día" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: days }, (_, index) => index + 1).map((day) => (
            <SelectItem key={day} value={day.toString()}>
              {pad(day)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={parsed.month.toString()}
        onValueChange={(month) => onChange(buildDate(parsed.year, Number(month), parsed.day))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Mes" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((month, index) => (
            <SelectItem key={month} value={(index + 1).toString()}>
              {compact ? month.slice(0, 3) : month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={parsed.year.toString()}
        onValueChange={(year) => onChange(buildDate(Number(year), parsed.month, parsed.day))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Año" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
