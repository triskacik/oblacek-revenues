-- Obláček — per-device choice of which push notifications to receive (Settings → Upozornění).
--
-- Additive only: one new column with a default (existing devices keep getting everything).
-- Back up before applying (`npm run db:backup`), then regenerate types (`npm run db:types`).

alter table public.push_subscriptions
  add column muted_kinds text[] not null default '{}'
  check (muted_kinds <@ array['sale', 'close', 'noexp', 'due']::text[]);

comment on column public.push_subscriptions.muted_kinds is
  'Notification kinds this device turned off: sale, close, noexp, due.';
