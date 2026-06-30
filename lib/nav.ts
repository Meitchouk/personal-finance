import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Target,
  PieChart,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

/** Primary destinations shown in the mobile bottom bar. */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Inicio", icon: LayoutDashboard },
  { href: "/transactions", label: "Transacciones", shortLabel: "Movimientos", icon: ArrowLeftRight },
  { href: "/categories", label: "Categorías", shortLabel: "Categorías", icon: Tags },
  { href: "/budgets", label: "Presupuesto", shortLabel: "Presupuesto", icon: Target },
  { href: "/reports", label: "Reportes", shortLabel: "Reportes", icon: PieChart },
];

/** Secondary destinations (sidebar / settings menu). */
export const SECONDARY_NAV: NavItem[] = [
  { href: "/settings", label: "Ajustes", shortLabel: "Ajustes", icon: Settings },
];
