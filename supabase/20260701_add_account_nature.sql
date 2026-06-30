-- Add nature (debit / credit) to accounts
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS nature text NOT NULL DEFAULT 'debit'
  CHECK (nature IN ('debit', 'credit'));
