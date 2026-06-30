export const DEFAULT_CATEGORIES = [
  // ── Alimentación ──────────────────────────────────────────────
  { name: "Comida", icon: "utensils", color: "#ef4444", type: "expense", is_default: true },
  { name: "Supermercado", icon: "cart", color: "#84cc16", type: "expense", is_default: true },
  { name: "Restaurantes", icon: "pizza", color: "#f97316", type: "expense", is_default: true },
  { name: "Café", icon: "coffee", color: "#d97706", type: "expense", is_default: true },

  // ── Transporte y vehículo ─────────────────────────────────────
  { name: "Transporte", icon: "bus", color: "#f97316", type: "expense", is_default: true },
  { name: "Gasolina", icon: "fuel", color: "#fb923c", type: "expense", is_default: true },
  { name: "Mantenimiento vehículo", icon: "tools", color: "#78716c", type: "expense", is_default: true },
  { name: "Viajes", icon: "plane", color: "#ec4899", type: "expense", is_default: true },

  // ── Vivienda y servicios ──────────────────────────────────────
  { name: "Vivienda / Alquiler", icon: "home", color: "#eab308", type: "expense", is_default: true },
  { name: "Electricidad", icon: "light", color: "#facc15", type: "expense", is_default: true },
  { name: "Agua", icon: "water", color: "#38bdf8", type: "expense", is_default: true },
  { name: "Internet", icon: "wifi", color: "#0284c7", type: "expense", is_default: true },
  { name: "Servicios varios", icon: "plug", color: "#64748b", type: "expense", is_default: true },

  // ── Finanzas personales ───────────────────────────────────────
  { name: "Pago de tarjetas", icon: "card", color: "#8b5cf6", type: "expense", is_default: true },
  { name: "Seguros", icon: "bill", color: "#6366f1", type: "expense", is_default: true },

  // ── Salud ─────────────────────────────────────────────────────
  { name: "Salud / Médico", icon: "health", color: "#22c55e", type: "expense", is_default: true },
  { name: "Farmacia", icon: "pill", color: "#16a34a", type: "expense", is_default: true },
  { name: "Deporte / Gimnasio", icon: "gym", color: "#10b981", type: "expense", is_default: true },

  // ── Educación y trabajo ───────────────────────────────────────
  { name: "Educación", icon: "education", color: "#06b6d4", type: "expense", is_default: true },

  // ── Ocio y personal ──────────────────────────────────────────
  { name: "Entretenimiento", icon: "movie", color: "#3b82f6", type: "expense", is_default: true },
  { name: "Suscripciones", icon: "tv", color: "#0ea5e9", type: "expense", is_default: true },
  { name: "Ropa", icon: "clothes", color: "#a855f7", type: "expense", is_default: true },
  { name: "Regalos", icon: "gift", color: "#f43f5e", type: "expense", is_default: true },

  // ── Otros ─────────────────────────────────────────────────────
  { name: "Otros gastos", icon: "other", color: "#78716c", type: "expense", is_default: true },

  // ── Ingresos ─────────────────────────────────────────────────
  { name: "Salario", icon: "salary", color: "#14b8a6", type: "income", is_default: true },
  { name: "Freelance", icon: "salary", color: "#0ea5e9", type: "income", is_default: true },
  { name: "Ventas", icon: "salary", color: "#8b5cf6", type: "income", is_default: true },
  { name: "Intereses / Inversiones", icon: "savings", color: "#10b981", type: "income", is_default: true },
  { name: "Alquiler cobrado", icon: "home", color: "#f59e0b", type: "income", is_default: true },
  { name: "Otros ingresos", icon: "other", color: "#64748b", type: "income", is_default: true },
] as const;
