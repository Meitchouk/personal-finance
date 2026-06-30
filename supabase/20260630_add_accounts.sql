-- ============================================================
-- Migration: add accounts feature
-- Run this in Supabase SQL Editor if you already ran schema.sql
-- ============================================================

-- ---------- Accounts ----------
create table if not exists public.accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null default 'other' check (type in ('bank', 'card', 'cash', 'digital', 'other')),
  color text not null default '#64748b',
  is_active boolean not null default true,
  created_at timestamptz default now()
);

alter table public.accounts enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'accounts' and policyname = 'Users can manage own accounts'
  ) then
    create policy "Users can manage own accounts" on public.accounts
      for all using (auth.uid() = user_id);
  end if;
end $$;

-- ---------- Link transactions → accounts ----------
alter table public.transactions
  add column if not exists account_id uuid references public.accounts(id) on delete set null;

create index if not exists transactions_user_account
  on public.transactions(user_id, account_id);
