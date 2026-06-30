"use client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategoryIcon } from "@/lib/icons";
import type { Category, TransactionFilters } from "@/lib/types";
import { Search } from "lucide-react";

interface Props {
  filters: TransactionFilters;
  categories: Category[];
  onChange: (f: TransactionFilters) => void;
}

export default function TransactionFiltersBar({ filters, categories, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          className="pl-9"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
        />
      </div>

      <div className="flex gap-2">
        <Select
          value={filters.type ?? "all"}
          onValueChange={(v) => onChange({ ...filters, type: (v as TransactionFilters["type"]) ?? "all" })}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="expense">Gastos</SelectItem>
            <SelectItem value="income">Ingresos</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category_id ?? "all"}
          onValueChange={(v) => onChange({ ...filters, category_id: !v || v === "all" ? undefined : v })}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => {
              const Icon = getCategoryIcon(c.icon);
              return (
                <SelectItem key={c.id} value={c.id}>
                  <Icon className="h-4 w-4" style={{ color: c.color }} />
                  {c.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Input
          type="date"
          aria-label="Desde"
          value={filters.date_from ?? ""}
          onChange={(e) => onChange({ ...filters, date_from: e.target.value || undefined })}
          className="flex-1"
        />
        <Input
          type="date"
          aria-label="Hasta"
          value={filters.date_to ?? ""}
          onChange={(e) => onChange({ ...filters, date_to: e.target.value || undefined })}
          className="flex-1"
        />
      </div>
    </div>
  );
}
