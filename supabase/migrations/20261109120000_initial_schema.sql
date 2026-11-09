-- Obláček — initial schema (see docs/DESIGN.md → Dáta, Bezpečnosť).
--
-- PRODUCTION DATABASE. Every later migration must be additive only (new table / defaulted column /
-- index / policy). Never DROP, TRUNCATE, rewrite or delete data. Back up before applying.
--
-- Access model: Sára and Tomáš share the same data. A signed-in user may read/write only when their
-- email is in public.allowed_users. allowed_users itself has RLS with no policies, so it is managed
-- only from the Supabase dashboard / SQL editor, never through the API.

-- ---------------------------------------------------------------------------------------------
-- Access
-- ---------------------------------------------------------------------------------------------

create table public.allowed_users (
  email text primary key check (email = lower(email))
);

alter table public.allowed_users enable row level security;

create function public.is_allowed_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.allowed_users
    where email = lower(auth.jwt() ->> 'email')
  );
$$;

revoke execute on function public.is_allowed_user() from public, anon;
grant execute on function public.is_allowed_user() to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Day-to-day records
-- ---------------------------------------------------------------------------------------------

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  amount numeric(12, 2) not null check (amount > 0),
  note text,
  created_at timestamptz not null default now()
);

create index expenses_date_idx on public.expenses (date);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  amount numeric(12, 2) not null check (amount >= 0), -- 0 = closed that day
  note text,
  created_at timestamptz not null default now()
);

create index sales_date_idx on public.sales (date);

-- Monthly income outside the till. Only Zásilkovna for now; `kind` leaves room for more.
create table public.other_incomes (
  id uuid primary key default gen_random_uuid(),
  month date not null check (extract(day from month) = 1),
  kind text not null default 'zasilkovna' check (kind in ('zasilkovna')),
  amount numeric(12, 2) not null check (amount > 0),
  note text,
  created_at timestamptz not null default now()
);

create index other_incomes_month_idx on public.other_incomes (month);

-- ---------------------------------------------------------------------------------------------
-- Fixed monthly costs
-- ---------------------------------------------------------------------------------------------

create table public.fixed_costs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  due_day smallint check (due_day between 1 and 31),
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

-- Amount valid from a month onwards; 0 ends the cost from that month. History is never rewritten.
create table public.fixed_cost_amounts (
  id uuid primary key default gen_random_uuid(),
  fixed_cost_id uuid not null references public.fixed_costs (id) on delete restrict,
  valid_from date not null check (extract(day from valid_from) = 1),
  amount numeric(12, 2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (fixed_cost_id, valid_from)
);

create table public.fixed_cost_payments (
  id uuid primary key default gen_random_uuid(),
  fixed_cost_id uuid not null references public.fixed_costs (id) on delete restrict,
  month date not null check (extract(day from month) = 1),
  paid_at date not null default current_date,
  created_at timestamptz not null default now(),
  unique (fixed_cost_id, month)
);

-- ---------------------------------------------------------------------------------------------
-- Weekly closing
-- ---------------------------------------------------------------------------------------------

create table public.week_closings (
  week_start date primary key check (extract(isodow from week_start) = 1), -- Monday
  seller_payout numeric(12, 2) not null check (seller_payout >= 0),
  to_fixed numeric(12, 2) not null check (to_fixed >= 0),
  owner_take numeric(12, 2) not null default 0 check (owner_take >= 0),
  surplus_at_close numeric(12, 2) not null,
  note text,
  closed_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------------------------
-- Settings (single row)
-- ---------------------------------------------------------------------------------------------

create table public.settings (
  id integer primary key default 1 check (id = 1),
  opening_date date,
  opening_fixed numeric(12, 2) not null default 0,
  opening_purchases numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------------------------
-- Row level security — every data table: allowed users only
-- ---------------------------------------------------------------------------------------------

alter table public.expenses enable row level security;
alter table public.sales enable row level security;
alter table public.other_incomes enable row level security;
alter table public.fixed_costs enable row level security;
alter table public.fixed_cost_amounts enable row level security;
alter table public.fixed_cost_payments enable row level security;
alter table public.week_closings enable row level security;
alter table public.settings enable row level security;

create policy "Allowed users have full access" on public.expenses
  for all to authenticated using (public.is_allowed_user()) with check (public.is_allowed_user());

create policy "Allowed users have full access" on public.sales
  for all to authenticated using (public.is_allowed_user()) with check (public.is_allowed_user());

create policy "Allowed users have full access" on public.other_incomes
  for all to authenticated using (public.is_allowed_user()) with check (public.is_allowed_user());

create policy "Allowed users have full access" on public.fixed_costs
  for all to authenticated using (public.is_allowed_user()) with check (public.is_allowed_user());

create policy "Allowed users have full access" on public.fixed_cost_amounts
  for all to authenticated using (public.is_allowed_user()) with check (public.is_allowed_user());

create policy "Allowed users have full access" on public.fixed_cost_payments
  for all to authenticated using (public.is_allowed_user()) with check (public.is_allowed_user());

create policy "Allowed users have full access" on public.week_closings
  for all to authenticated using (public.is_allowed_user()) with check (public.is_allowed_user());

-- The settings row is created above and must never be deleted.
create policy "Allowed users can read settings" on public.settings
  for select to authenticated using (public.is_allowed_user());

create policy "Allowed users can update settings" on public.settings
  for update to authenticated using (public.is_allowed_user()) with check (public.is_allowed_user());
