-- Dashboard Financeiro — schema estilo Mobills
-- Multi-tenant por usuário (auth.users) com RLS

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  currency text not null default 'BRL',
  week_starts_on smallint not null default 1 check (week_starts_on between 0 and 6),
  notify_budgets boolean not null default true,
  notify_invoices boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Accounts (contas bancárias / carteira)
-- ---------------------------------------------------------------------------

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  type text not null check (type in ('checking', 'savings', 'cash', 'investment')),
  balance numeric(14, 2) not null default 0,
  color text not null default '#7eb8ff',
  institution text,
  is_archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index accounts_user_id_idx on public.accounts (user_id);

create trigger accounts_set_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text not null default 'Circle',
  color text not null default '#7eb8ff',
  monthly_budget numeric(14, 2),
  is_archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, name, type)
);

create index categories_user_id_idx on public.categories (user_id);

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Credit cards
-- ---------------------------------------------------------------------------

create table public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  brand text not null check (brand in ('Visa', 'Mastercard', 'Elo', 'Amex', 'Hipercard', 'Other')),
  credit_limit numeric(14, 2) not null check (credit_limit >= 0),
  closing_day smallint not null check (closing_day between 1 and 31),
  due_day smallint not null check (due_day between 1 and 31),
  color text not null default '#820ad1',
  is_archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index credit_cards_user_id_idx on public.credit_cards (user_id);

create trigger credit_cards_set_updated_at
before update on public.credit_cards
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Transactions (lançamentos em conta)
-- ---------------------------------------------------------------------------

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete restrict,
  category_id uuid not null references public.categories (id) on delete restrict,
  description text not null,
  amount numeric(14, 2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  status text not null default 'cleared' check (status in ('cleared', 'pending')),
  occurred_on date not null default (timezone('utc', now()))::date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index transactions_user_id_idx on public.transactions (user_id);
create index transactions_occurred_on_idx on public.transactions (user_id, occurred_on desc);
create index transactions_account_id_idx on public.transactions (account_id);
create index transactions_category_id_idx on public.transactions (category_id);

create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Credit card invoices + purchases
-- ---------------------------------------------------------------------------

create table public.credit_card_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  credit_card_id uuid not null references public.credit_cards (id) on delete cascade,
  reference_month date not null,
  closing_date date not null,
  due_date date not null,
  total_amount numeric(14, 2) not null default 0,
  status text not null default 'open' check (status in ('open', 'closed', 'paid')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (credit_card_id, reference_month)
);

create index credit_card_invoices_user_id_idx on public.credit_card_invoices (user_id);

create trigger credit_card_invoices_set_updated_at
before update on public.credit_card_invoices
for each row execute function public.set_updated_at();

create table public.credit_card_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  credit_card_id uuid not null references public.credit_cards (id) on delete cascade,
  invoice_id uuid references public.credit_card_invoices (id) on delete set null,
  category_id uuid not null references public.categories (id) on delete restrict,
  description text not null,
  amount numeric(14, 2) not null check (amount > 0),
  purchased_on date not null,
  installments smallint not null default 1 check (installments >= 1),
  installment_number smallint not null default 1 check (installment_number >= 1),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index credit_card_purchases_user_id_idx on public.credit_card_purchases (user_id);
create index credit_card_purchases_card_id_idx on public.credit_card_purchases (credit_card_id);

create trigger credit_card_purchases_set_updated_at
before update on public.credit_card_purchases
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Budgets (orçamentos mensais)
-- ---------------------------------------------------------------------------

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  month date not null,
  amount_limit numeric(14, 2) not null check (amount_limit >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, category_id, month)
);

create index budgets_user_id_idx on public.budgets (user_id);

create trigger budgets_set_updated_at
before update on public.budgets
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Goals (metas)
-- ---------------------------------------------------------------------------

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  target_amount numeric(14, 2) not null check (target_amount > 0),
  current_amount numeric(14, 2) not null default 0 check (current_amount >= 0),
  deadline date,
  color text not null default '#7eb8ff',
  is_completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index goals_user_id_idx on public.goals (user_id);

create trigger goals_set_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Views úteis (dashboard)
-- ---------------------------------------------------------------------------

create or replace view public.v_account_balances
with (security_invoker = true)
as
select
  a.id,
  a.user_id,
  a.name,
  a.type,
  a.color,
  a.balance
    + coalesce(sum(case when t.type = 'income' and t.status = 'cleared' then t.amount else 0 end), 0)
    - coalesce(sum(case when t.type = 'expense' and t.status = 'cleared' then t.amount else 0 end), 0)
    as computed_balance
from public.accounts a
left join public.transactions t on t.account_id = a.id
where a.is_archived = false
group by a.id;

create or replace view public.v_credit_card_usage
with (security_invoker = true)
as
select
  c.id,
  c.user_id,
  c.name,
  c.brand,
  c.credit_limit,
  c.color,
  coalesce(sum(p.amount), 0) as used_amount,
  c.credit_limit - coalesce(sum(p.amount), 0) as available_amount
from public.credit_cards c
left join public.credit_card_purchases p
  on p.credit_card_id = c.id
 and p.purchased_on >= date_trunc('month', timezone('utc', now()))::date
where c.is_archived = false
group by c.id;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.credit_cards enable row level security;
alter table public.transactions enable row level security;
alter table public.credit_card_invoices enable row level security;
alter table public.credit_card_purchases enable row level security;
alter table public.budgets enable row level security;
alter table public.goals enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "accounts_all_own" on public.accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "categories_all_own" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "credit_cards_all_own" on public.credit_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions_all_own" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "credit_card_invoices_all_own" on public.credit_card_invoices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "credit_card_purchases_all_own" on public.credit_card_purchases
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "budgets_all_own" on public.budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals_all_own" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Signup bootstrap (perfil + categorias padrão Mobills)
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );

  insert into public.categories (user_id, name, type, icon, color, monthly_budget) values
    (new.id, 'Salário', 'income', 'Briefcase', '#4ade80', null),
    (new.id, 'Freelance', 'income', 'Laptop', '#34d399', null),
    (new.id, 'Investimentos', 'income', 'TrendingUp', '#22d3ee', null),
    (new.id, 'Alimentação', 'expense', 'Utensils', '#fb7185', 1200),
    (new.id, 'Moradia', 'expense', 'Home', '#60a5fa', 2500),
    (new.id, 'Transporte', 'expense', 'Car', '#fbbf24', 600),
    (new.id, 'Lazer', 'expense', 'Sparkles', '#a78bfa', 400),
    (new.id, 'Saúde', 'expense', 'HeartPulse', '#f472b6', 350),
    (new.id, 'Assinaturas', 'expense', 'Repeat', '#38bdf8', 180),
    (new.id, 'Educação', 'expense', 'GraduationCap', '#818cf8', 300),
    (new.id, 'Outros', 'expense', 'MoreHorizontal', '#94a3b8', null);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
