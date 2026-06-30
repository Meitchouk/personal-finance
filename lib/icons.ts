import {
  UtensilsCrossed, ShoppingCart, ShoppingBag, Coffee, Beer, Pizza,
  Car, Bus, Fuel, Plane, Train, Bike,
  Home, Lightbulb, Droplets, Flame, Wifi, Wrench,
  HeartPulse, Pill, Stethoscope, Dumbbell,
  Clapperboard, Music, Gamepad2, Tv, Ticket,
  Shirt, Scissors, Sparkles, Gift,
  BookOpen, GraduationCap, Briefcase, Building2,
  Smartphone, Phone, Laptop, CreditCard, Receipt, Landmark, PiggyBank,
  Wallet, DollarSign, TrendingUp, Banknote, Coins,
  Dog, Baby, TreePine, Plug, Package,
  type LucideIcon,
} from "lucide-react";

export interface IconEntry {
  key: string;
  label: string;
  Icon: LucideIcon;
}

/** Curated finance-oriented icon set. The `key` string is what gets persisted. */
export const CATEGORY_ICONS: IconEntry[] = [
  { key: "utensils", label: "Comida", Icon: UtensilsCrossed },
  { key: "cart", label: "Supermercado", Icon: ShoppingCart },
  { key: "bag", label: "Compras", Icon: ShoppingBag },
  { key: "coffee", label: "Café", Icon: Coffee },
  { key: "beer", label: "Bebidas", Icon: Beer },
  { key: "pizza", label: "Restaurante", Icon: Pizza },
  { key: "car", label: "Auto", Icon: Car },
  { key: "bus", label: "Transporte", Icon: Bus },
  { key: "fuel", label: "Combustible", Icon: Fuel },
  { key: "plane", label: "Viajes", Icon: Plane },
  { key: "train", label: "Tren", Icon: Train },
  { key: "bike", label: "Bicicleta", Icon: Bike },
  { key: "home", label: "Vivienda", Icon: Home },
  { key: "light", label: "Electricidad", Icon: Lightbulb },
  { key: "water", label: "Agua", Icon: Droplets },
  { key: "gas", label: "Gas", Icon: Flame },
  { key: "wifi", label: "Internet", Icon: Wifi },
  { key: "tools", label: "Reparaciones", Icon: Wrench },
  { key: "health", label: "Salud", Icon: HeartPulse },
  { key: "pill", label: "Farmacia", Icon: Pill },
  { key: "doctor", label: "Médico", Icon: Stethoscope },
  { key: "gym", label: "Gimnasio", Icon: Dumbbell },
  { key: "movie", label: "Cine", Icon: Clapperboard },
  { key: "music", label: "Música", Icon: Music },
  { key: "games", label: "Videojuegos", Icon: Gamepad2 },
  { key: "tv", label: "Streaming", Icon: Tv },
  { key: "ticket", label: "Eventos", Icon: Ticket },
  { key: "clothes", label: "Ropa", Icon: Shirt },
  { key: "beauty", label: "Belleza", Icon: Scissors },
  { key: "care", label: "Cuidado personal", Icon: Sparkles },
  { key: "gift", label: "Regalos", Icon: Gift },
  { key: "book", label: "Libros", Icon: BookOpen },
  { key: "education", label: "Educación", Icon: GraduationCap },
  { key: "work", label: "Trabajo", Icon: Briefcase },
  { key: "office", label: "Oficina", Icon: Building2 },
  { key: "phone", label: "Teléfono", Icon: Smartphone },
  { key: "call", label: "Llamadas", Icon: Phone },
  { key: "laptop", label: "Tecnología", Icon: Laptop },
  { key: "card", label: "Tarjeta", Icon: CreditCard },
  { key: "bill", label: "Facturas", Icon: Receipt },
  { key: "bank", label: "Banco", Icon: Landmark },
  { key: "savings", label: "Ahorros", Icon: PiggyBank },
  { key: "wallet", label: "Billetera", Icon: Wallet },
  { key: "salary", label: "Salario", Icon: DollarSign },
  { key: "income", label: "Ingresos", Icon: TrendingUp },
  { key: "cash", label: "Efectivo", Icon: Banknote },
  { key: "coins", label: "Monedas", Icon: Coins },
  { key: "pet", label: "Mascotas", Icon: Dog },
  { key: "baby", label: "Hijos", Icon: Baby },
  { key: "nature", label: "Naturaleza", Icon: TreePine },
  { key: "plug", label: "Servicios", Icon: Plug },
  { key: "other", label: "Otros", Icon: Package },
];

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICONS.map((e) => [e.key, e.Icon])
);

/** Resolve a persisted icon key to its component, falling back to a neutral icon. */
export function getCategoryIcon(key: string | null | undefined): LucideIcon {
  if (key && ICON_MAP[key]) return ICON_MAP[key];
  return Package;
}

export const DEFAULT_ICON_KEY = "other";
