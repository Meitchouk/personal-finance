import {
  LayoutDashboard,
  ArrowLeftRight,
  HandCoins,
  Target,
  PieChart,
  Settings,
  Wallet,
  Tags,
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
  { href: "/debts", label: "Por pagar", shortLabel: "Por pagar", icon: HandCoins },
  { href: "/budgets", label: "Presupuesto", shortLabel: "Presupuesto", icon: Target },
  { href: "/reports", label: "Reportes", shortLabel: "Reportes", icon: PieChart },
];

/** Secondary destinations (sidebar / settings menu). */
export const SECONDARY_NAV: NavItem[] = [
  { href: "/accounts", label: "Cuentas", shortLabel: "Cuentas", icon: Wallet },
  { href: "/categories", label: "Categorías", shortLabel: "Categorías", icon: Tags },
  { href: "/settings", label: "Ajustes", shortLabel: "Ajustes", icon: Settings },
];
