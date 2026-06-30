-- Product catalog per creditor (for quick debt entry)
CREATE TABLE IF NOT EXISTS public.debt_products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id     uuid NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  name        text NOT NULL,
  unit_price  numeric(12,2) NOT NULL CHECK (unit_price > 0),
  unit        text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.debt_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own debt products"
  ON public.debt_products FOR ALL
  USING  (debt_id IN (SELECT id FROM public.debts WHERE user_id = auth.uid()))
  WITH CHECK (debt_id IN (SELECT id FROM public.debts WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS debt_products_debt_idx ON public.debt_products(debt_id);
