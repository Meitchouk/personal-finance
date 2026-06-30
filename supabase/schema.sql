-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (1:1 with auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Categories table
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  emoji text not null default '📦',
  color text not null default '#6b7280',
  is_default boolean default false,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;
create policy "Users can manage own categories" on public.categories
  for all using (auth.uid() = user_id);

-- Transactions table
create type transaction_type as enum ('income', 'expense');

create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
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

-- Budgets table
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

-- Function: seed default categories on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  insert into public.categories (user_id, name, emoji, color, is_default) values
    (new.id, 'Comida', '🍔', '#ef4444', true),
    (new.id, 'Transporte', '🚗', '#f97316', true),
    (new.id, 'Vivienda', '🏠', '#eab308', true),
    (new.id, 'Salud', '💊', '#22c55e', true),
    (new.id, 'Entretenimiento', '🎬', '#3b82f6', true),
    (new.id, 'Ropa', '👕', '#8b5cf6', true),
    (new.id, 'Educación', '📚', '#06b6d4', true),
    (new.id, 'Viajes', '✈️', '#ec4899', true),
    (new.id, 'Deporte', '💪', '#10b981', true),
    (new.id, 'Sueldo', '💰', '#22c55e', true),
    (new.id, 'Otros', '📦', '#6b7280', true);

  return new;
end;
$$;

-- Trigger: fire handle_new_user on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
