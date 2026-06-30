-- ============================================================
-- FinanzasApp — esquema completo. Ejecutar en Supabase SQL Editor.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- Profiles (1:1 con auth.users) ----------
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  currency text not null default 'NIO' check (currency in ('NIO', 'USD')),
  google_sheet_id text,
  google_sheet_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- ---------- Exchange rates ----------
create table public.exchange_rates (
  id uuid primary key default uuid_generate_v4(),
  source_currency text not null check (source_currency in ('NIO', 'USD')),
  target_currency text not null check (target_currency in ('NIO', 'USD')),
  rate numeric(12,6) not null check (rate > 0),
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique(source_currency, target_currency)
);

alter table public.exchange_rates enable row level security;
create policy "Authenticated users can view exchange rates" on public.exchange_rates
  for select to authenticated using (true);

insert into public.exchange_rates (source_currency, target_currency, rate) values
  ('NIO', 'NIO', 1),
  ('USD', 'USD', 1),
  ('NIO', 'USD', 0.027),
  ('USD', 'NIO', 36.81);

-- ---------- Categories ----------
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text not null default 'other',
  color text not null default '#10b981',
  type text not null default 'expense' check (type in ('income', 'expense')),
  is_default boolean default false,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;
create policy "Users can manage own categories" on public.categories
  for all using (auth.uid() = user_id);

-- ---------- Transactions ----------
create type transaction_type as enum ('income', 'expense');

create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  original_amount numeric(12,2) not null check (original_amount > 0),
  original_currency text not null default 'NIO' check (original_currency in ('NIO', 'USD')),
  exchange_rate numeric(12,6) not null default 1 check (exchange_rate > 0),
  type transaction_type not null,
  description text not null,
  date date not null,
  is_recurring boolean default false,
  recurrence_rule text,
  parent_recurring_id uuid references public.transactions(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;
create policy "Users can manage own transactions" on public.transactions
  for all using (auth.uid() = user_id);

create index transactions_user_date on public.transactions(user_id, date desc);
create index transactions_user_category on public.transactions(user_id, category_id);

-- ---------- Budgets ----------
create table public.budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  monthly_limit numeric(12,2) not null check (monthly_limit > 0),
  created_at timestamptz default now(),
  unique(user_id, category_id)
);

alter table public.budgets enable row level security;
create policy "Users can manage own budgets" on public.budgets
  for all using (auth.uid() = user_id);

-- ---------- Seed default categories + profile on signup ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  insert into public.categories (user_id, name, icon, color, type, is_default) values
    (new.id, 'Comida',          'utensils',  '#ef4444', 'expense', true),
    (new.id, 'Transporte',      'bus',       '#f97316', 'expense', true),
    (new.id, 'Vivienda',        'home',      '#eab308', 'expense', true),
    (new.id, 'Salud',           'health',    '#22c55e', 'expense', true),
    (new.id, 'Entretenimiento', 'movie',     '#3b82f6', 'expense', true),
    (new.id, 'Ropa',            'clothes',   '#8b5cf6', 'expense', true),
    (new.id, 'Educación',       'education', '#06b6d4', 'expense', true),
    (new.id, 'Viajes',          'plane',     '#ec4899', 'expense', true),
    (new.id, 'Deporte',         'gym',       '#10b981', 'expense', true),
    (new.id, 'Servicios',       'home',      '#64748b', 'expense', true),
    (new.id, 'Salario',         'salary',    '#14b8a6', 'income',  true),
    (new.id, 'Freelance',       'salary',    '#0ea5e9', 'income',  true),
    (new.id, 'Ventas',          'salary',    '#8b5cf6', 'income',  true),
    (new.id, 'Intereses',       'salary',    '#10b981', 'income',  true),
    (new.id, 'Otros ingresos',  'other',     '#64748b', 'income',  true),
    (new.id, 'Otros gastos',    'other',     '#78716c', 'expense', true);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
