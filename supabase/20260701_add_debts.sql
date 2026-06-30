-- Debts (fiado / tabs owed to creditors)
CREATE TABLE IF NOT EXISTS public.debts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creditor_name  text NOT NULL,
  notes          text,
  account_id     uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own debts"
  ON public.debts FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS debts_user_idx ON public.debts(user_id, created_at DESC);

-- Individual items within a debt tab
CREATE TABLE IF NOT EXISTS public.debt_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id      uuid NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  description  text NOT NULL,
  amount       numeric(12,2) NOT NULL CHECK (amount > 0),
  item_date    date NOT NULL DEFAULT CURRENT_DATE,
  is_paid      boolean NOT NULL DEFAULT false,
  paid_at      timestamptz,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.debt_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own debt items"
  ON public.debt_items FOR ALL
  USING  (debt_id IN (SELECT id FROM public.debts WHERE user_id = auth.uid()))
  WITH CHECK (debt_id IN (SELECT id FROM public.debts WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS debt_items_debt_idx ON public.debt_items(debt_id, created_at);
