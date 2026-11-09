-- Obláček — shop opening days and closing time (see docs/DESIGN.md → Pojmy, Upozornenia).
--
-- Additive only: two new columns with defaults on the single settings row. No existing data changes.
-- Back up before applying (`npm run db:backup`), then regenerate types (`npm run db:types`).

alter table public.settings
  -- ISO weekdays the shop is open (1 = Monday … 7 = Sunday). Currently Monday–Friday.
  add column open_days smallint[] not null default '{1,2,3,4,5}'
    check (cardinality(open_days) between 1 and 7 and open_days <@ '{1,2,3,4,5,6,7}'::smallint[]),
  -- Same closing time every open day; after it, today's sales are expected.
  add column closing_time time not null default '18:00';
