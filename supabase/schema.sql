-- ============================================================
-- DompetKos — skema database Supabase
-- Cara pakai: buka Supabase Dashboard > SQL Editor > tempel file ini > Run
-- ============================================================

-- 1) Profil pengguna (1 baris per user)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

-- 2) Pengeluaran
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null check (amount > 0),
  category text not null,
  note text,
  spent_at date not null default current_date,
  created_at timestamptz default now()
);

-- 3) Budget bulanan (category = 'TOTAL' untuk budget keseluruhan,
--    atau nama kategori untuk budget per kategori). Format month: 'YYYY-MM'
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  category text not null,
  amount numeric not null check (amount >= 0),
  created_at timestamptz default now(),
  unique(user_id, month, category)
);

-- Index untuk query cepat
create index if not exists expenses_user_month_idx
  on public.expenses (user_id, spent_at desc);
create index if not exists budgets_user_month_idx
  on public.budgets (user_id, month);

-- 4) Row Level Security
alter table public.profiles enable row level security;
alter table public.expenses enable row level security;
alter table public.budgets enable row level security;

-- Profiles: user hanya bisa akses baris miliknya sendiri
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Expenses: user hanya bisa CRUD baris miliknya
drop policy if exists "expenses_all_own" on public.expenses;
create policy "expenses_all_own" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Budgets: user hanya bisa CRUD baris miliknya
drop policy if exists "budgets_all_own" on public.budgets;
create policy "budgets_all_own" on public.budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5) Trigger: otomatis buat row profiles saat user baru mendaftar
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
