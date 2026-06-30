"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DateSelectFields from "@/components/shared/DateSelectFields";
import FilterPills from "@/components/shared/FilterPills";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { getCategoryIcon } from "@/lib/icons";
import type { Category, TransactionFilters } from "@/lib/types";
import {
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  TrendingDown,
  TrendingUp,
  LayoutList,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  filters: TransactionFilters;
  categories: Category[];
  onChange: (f: TransactionFilters) => void;
}

const TYPE_OPTIONS = [
  { value: "all", label: "Todos", icon: LayoutList },
  { value: "expense", label: "Gastos", icon: TrendingDown, activeClass: "text-expense" },
  { value: "income", label: "Ingresos", icon: TrendingUp, activeClass: "text-income" },
];

function fmtDate(d: string) {
  return format(parseISO(d), "d MMM", { locale: es });
}

function formatDateSummary(from?: string, to?: string): string {
  if (!from && !to) return "Período";
  if (from && to) return `${fmtDate(from)} – ${fmtDate(to)}`;
  if (from) return `Desde ${fmtDate(from)}`;
  return `Hasta ${fmtDate(to!)}`;
}

export default function TransactionFiltersBar({ filters, categories, onChange }: Props) {
  const [dateOpen, setDateOpen] = useState(false);

  const visibleCategories =
    filters.type && filters.type !== "all"
      ? categories.filter((c) => c.type === filters.type)
      : categories;

  const selectedCategory = categories.find((c) => c.id === filters.category_id);
  const SelectedCategoryIcon = selectedCategory ? getCategoryIcon(selectedCategory.icon) : null;

  const hasDateFilter = !!(filters.date_from || filters.date_to);
  const isFiltered =
    !!filters.search ||
    !!filters.category_id ||
    (!!filters.type && filters.type !== "all");
  const anyFilterActive = isFiltered || hasDateFilter;

  function clearAll() {
    onChange({});
    setDateOpen(false);
  }

  function clearNonDate() {
    onChange({ date_from: filters.date_from, date_to: filters.date_to });
  }

  function clearDates() {
    const { date_from: _f, date_to: _t, ...rest } = filters;
    onChange(rest);
    setDateOpen(false);
  }

  function handleTypeChange(type: string) {
    const typedType = type as TransactionFilters["type"];
    const categoryStillApplies =
      !filters.category_id ||
      type === "all" ||
      categories.some((c) => c.id === filters.category_id && c.type === typedType);
    onChange({
      ...filters,
      type: typedType,
      category_id: categoryStillApplies ? filters.category_id : undefined,
    });
  }

  const categoryTriggerContent = selectedCategory && SelectedCategoryIcon ? (
    <span className="flex items-center gap-2">
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${selectedCategory.color}22` }}
      >
        <SelectedCategoryIcon className="h-3 w-3" style={{ color: selectedCategory.color }} />
      </span>
      <span className="truncate">{selectedCategory.name}</span>
    </span>
  ) : (
    <span className="flex items-center gap-2 text-muted-foreground">
      <Tag className="h-3.5 w-3.5 shrink-0" />
      Todas las categorías
    </span>
  );

  return (
    <div className="space-y-2">
      {/* ── Row 1: search + (desktop) type pills ─────────────────── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por descripción..."
            className="pl-9"
            value={filters.search ?? ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
          />
        </div>

        {/* Pills: inline on desktop */}
        <FilterPills
          options={TYPE_OPTIONS}
          value={filters.type ?? "all"}
          onChange={handleTypeChange}
          className="hidden shrink-0 md:flex"
        />
      </div>

      {/* ── Type pills: mobile only ───────────────────────────────── */}
      <FilterPills
        options={TYPE_OPTIONS}
        value={filters.type ?? "all"}
        onChange={handleTypeChange}
        className="md:hidden"
      />

      {/* ── Row 2: category + date ────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-2">
        {/* Category select */}
        <Select
          value={filters.category_id ?? ""}
          onValueChange={(v) =>
            onChange({ ...filters, category_id: !v ? undefined : v })
          }
        >
          <SelectTrigger className="h-9 w-full text-sm md:w-52">
            {categoryTriggerContent}
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="">Todas las categorías</SelectItem>
            {visibleCategories.map((c) => {
              const Icon = getCategoryIcon(c.icon);
              return (
                <SelectItem key={c.id} value={c.id}>
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${c.color}22` }}
                  >
                    <Icon className="h-3 w-3" style={{ color: c.color }} />
                  </span>
                  {c.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Desktop date — always visible, inline */}
        <div className="hidden flex-1 items-end gap-2 md:flex">
          <div className="space-y-1">
            <span className="block text-xs font-medium text-muted-foreground">Desde</span>
            <DateSelectFields
              value={filters.date_from}
              onChange={(date) => onChange({ ...filters, date_from: date })}
              compact
            />
          </div>
          <span className="mb-2 text-sm text-muted-foreground">–</span>
          <div className="space-y-1">
            <span className="block text-xs font-medium text-muted-foreground">Hasta</span>
            <DateSelectFields
              value={filters.date_to}
              onChange={(date) => onChange({ ...filters, date_to: date })}
              compact
            />
          </div>
        </div>

        {/* Clear all — desktop */}
        {anyFilterActive && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearAll}
            aria-label="Limpiar todos los filtros"
            className="hidden h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground md:flex"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Mobile: clear non-date filters */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearNonDate}
            aria-label="Limpiar filtros"
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground md:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* ── Mobile date range — collapsible ──────────────────────── */}
      <div className="overflow-hidden rounded-lg border border-border md:hidden">
        <button
          type="button"
          onClick={() => setDateOpen((v) => !v)}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
            hasDateFilter ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <Calendar className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left font-medium">
            {formatDateSummary(filters.date_from, filters.date_to)}
          </span>
          {hasDateFilter && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                clearDates();
              }}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar período"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          {dateOpen ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </button>

        {dateOpen && (
          <div className="grid gap-3 border-t border-border bg-muted/20 px-3 pb-3 pt-2.5">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Desde</span>
              <DateSelectFields
                value={filters.date_from}
                onChange={(date) => onChange({ ...filters, date_from: date })}
                compact
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Hasta</span>
              <DateSelectFields
                value={filters.date_to}
                onChange={(date) => onChange({ ...filters, date_to: date })}
                compact
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
