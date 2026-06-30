-- Add fixed exchange rates and transaction currency audit fields.
-- Run once in Supabase SQL Editor for existing databases.

create table if not exists public.exchange_rates (
  id uuid primary key default uuid_generate_v4(),
  source_currency text not null check (source_currency in ('NIO', 'USD')),
  target_currency text not null check (target_currency in ('NIO', 'USD')),
  rate numeric(12,6) not null check (rate > 0),
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique(source_currency, target_currency)
);

alter table public.exchange_rates enable row level security;

drop policy if exists "Authenticated users can view exchange rates" on public.exchange_rates;
create policy "Authenticated users can view exchange rates" on public.exchange_rates
  for select to authenticated using (true);

insert into public.exchange_rates (source_currency, target_currency, rate)
values
  ('NIO', 'NIO', 1),
  ('USD', 'USD', 1),
  ('NIO', 'USD', 0.027),
  ('USD', 'NIO', 36.81)
on conflict (source_currency, target_currency)
do update set
  rate = excluded.rate,
  is_active = true,
  updated_at = now();

alter table public.transactions
  add column if not exists original_amount numeric(12,2),
  add column if not exists original_currency text default 'NIO',
  add column if not exists exchange_rate numeric(12,6) default 1;

update public.transactions
set
  original_amount = coalesce(original_amount, amount),
  original_currency = coalesce(original_currency, 'NIO'),
  exchange_rate = coalesce(exchange_rate, 1);

alter table public.transactions
  alter column original_amount set not null,
  alter column original_currency set not null,
  alter column exchange_rate set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'transactions_original_amount_check'
  ) then
    alter table public.transactions
      add constraint transactions_original_amount_check check (original_amount > 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'transactions_original_currency_check'
  ) then
    alter table public.transactions
      add constraint transactions_original_currency_check check (original_currency in ('NIO', 'USD'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'transactions_exchange_rate_check'
  ) then
    alter table public.transactions
      add constraint transactions_exchange_rate_check check (exchange_rate > 0);
  end if;
end $$;

alter table public.categories
  add column if not exists type text default 'expense';

update public.categories
set type = 'income'
where name in ('Salario', 'Freelance', 'Ventas', 'Intereses', 'Otros ingresos');

update public.categories
set type = 'expense'
where type is null;

alter table public.categories
  alter column type set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'categories_type_check'
  ) then
    alter table public.categories
      add constraint categories_type_check check (type in ('income', 'expense'));
  end if;
end $$;
