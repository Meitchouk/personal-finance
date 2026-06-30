-- Transaction templates (quick-access shortcuts)
CREATE TABLE IF NOT EXISTS transaction_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description     text NOT NULL,
  type            text NOT NULL CHECK (type IN ('income', 'expense')),
  original_amount numeric(12,2) NOT NULL CHECK (original_amount > 0),
  original_currency text NOT NULL DEFAULT 'NIO',
  category_id     uuid REFERENCES categories(id) ON DELETE SET NULL,
  account_id      uuid REFERENCES accounts(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE transaction_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own templates"
  ON transaction_templates FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS templates_user_idx
  ON transaction_templates (user_id, created_at DESC);
