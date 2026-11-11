-- Obláček — informative alerts Sára chose to hide (see docs/DESIGN.md → Upozornenia).
--
-- Additive only: a new table. One row per hidden alert, keyed by the alert's stable id
-- (e.g. `zasilkovna-2026-10`, `no-expenses-2026-11-09`). Shared by both users, so hiding an alert
-- on the phone hides it on the laptop too. Back up before applying (`npm run db:backup`), then
-- regenerate types (`npm run db:types`).

create table public.dismissed_alerts (
  id text primary key check (length(id) between 1 and 200),
  dismissed_at timestamptz not null default now()
);

alter table public.dismissed_alerts enable row level security;

create policy "Allowed users have full access" on public.dismissed_alerts
  for all to authenticated using (public.is_allowed_user()) with check (public.is_allowed_user());
