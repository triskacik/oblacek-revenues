-- Obláček — push notifications (see docs/DESIGN.md → Notifikácie).
--
-- Additive only: one new settings column with a default, two new tables, two extensions and one
-- scheduled job. No existing data changes. Back up before applying (`npm run db:backup`), then
-- regenerate types (`npm run db:types`).
--
-- The scheduled job calls the `send-notifications` Edge Function every 15 minutes. It reads the
-- function URL and a shared secret from Supabase Vault (created by hand, see README → Notifikácie),
-- so no secret is ever stored in this repository. Until those exist, the job simply fails quietly.

-- When to remind about a missing daily sale (Settings → Upozornění).
alter table public.settings
  add column reminder_time time not null default '20:00';

-- One row per device that turned notifications on (Sára's iPhone, Tomáš's laptop, …).
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_email text not null default lower(auth.jwt() ->> 'email'),
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create policy "Allowed users have full access" on public.push_subscriptions
  for all to authenticated using (public.is_allowed_user()) with check (public.is_allowed_user());

-- Which notifications were already sent, so each one goes out once (key e.g. `sale-2026-11-12`).
-- Only the Edge Function (service role) touches it: RLS on, no policies.
create table public.notification_log (
  key text primary key check (length(key) between 1 and 200),
  sent_at timestamptz not null default now()
);

alter table public.notification_log enable row level security;

-- Scheduler + HTTP from the database (both available on the free plan).
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'oblacek-send-notifications',
  '*/15 * * * *',
  $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'oblacek_functions_url')
      || '/send-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'oblacek_cron_secret')
    ),
    body := '{}'::jsonb
  );
  $job$
);
