# Obláček — agent coding standard

Source of truth for how to work in **oblacek-revenues**. The same document is published as:

- `CLAUDE.md` — Claude Code
- `AGENTS.md` — Cursor / other agents

Keep both files in sync.

**Product spec: [`docs/DESIGN.md`](docs/DESIGN.md).** Read it before any feature work. It defines the money model
(weekly closing, two envelopes, payout recommendation), screens, schema and security. If a request conflicts
with it, ask — then update `DESIGN.md` in the same change.

---

## What this app is

A simple weekly overview for Sára's small grocery shop, replacing an Excel sheet. She enters expenses, daily
sales and the monthly Zásilkovna income; the app tells her how much she can pay the shop assistant this week
while keeping money for next week's stock purchases and the monthly fixed costs.

**It is not accounting software.** Prefer the simplest solution that keeps the numbers trustworthy. New
features, columns or settings that aren't in `DESIGN.md` need the user's OK; nice-to-haves go to the
"Neskôr" section of `DESIGN.md` instead of being built.

- Users: Sára and Tomáš only (same shared data, no roles).
- **Primary device: MacBook** — dashboard layouts, charts. Must stay fully usable on mobile (quick entry).
- UI language: **Czech** (no i18n, strings inline). Currency **CZK**. Not a VAT payer.
- The author is Slovak; docs and discussion may be in Slovak, UI copy is Czech.

---

## ⚠️ Production database — data must never be lost

There is **exactly one Supabase database and it is production**. Real shop data lives there.

1. **Never modify or delete data** in the database — no `UPDATE`, `DELETE`, `TRUNCATE`, no ad-hoc SQL writes,
   no "cleanup", no fixing records by hand. Not via CLI, SQL editor, scripts, REST, MCP, or the running app.
2. **Never insert test / sample / seed data** into it. When verifying UI, don't submit forms that write real rows
   unless the user explicitly asks for that specific action.
3. **Migrations are additive only**: new table, new nullable/defaulted column, index, policy, function.
   Anything destructive (`DROP`, rename, type change, data backfill) requires the user's explicit approval for
   that migration **and** a fresh backup first.
4. **Never apply migrations yourself** unless the user explicitly says so for that migration. Write the SQL
   file in `supabase/migrations/`, show it, and let the user run it. Always back up first (`npm run db:backup`).
5. **Never run** `supabase db reset`, `supabase db push --include-seed`, or any seed against the remote project.
6. Never put the `service_role` key, DB password or any secret in the frontend, in committed files or in chat.
   The frontend uses only the `anon` / publishable key; security comes from RLS.
7. Every table has **RLS enabled** with the `allowed_users` email check (see `DESIGN.md` → Bezpečnosť).
   A migration that adds a table without RLS is a bug.

If you are unsure whether something touches production data — stop and ask.

---

## Visual design

The look is our own — **do not copy benefit-ng-react's UI**; only its stack and code structure.
Target user: Sára (26). Friendly, a bit cute, calm. Full rules: `docs/DESIGN.md` → Vizuálny štýl.

- **One light theme. No dark mode**, no theme switcher, never set a `.dark` class.
- Colors come from the Potraviny Obláček logo; use the tokens in `src/styles.css`
  (`olive`, `terracotta`, `tan`, `sage`, `honey`, `blush`, `chalkboard`, `chalk`…), never raw hex in TSX.
- **No red and no alarming copy.** Shortfalls are terracotta with supportive wording. `destructive`
  is only for real app errors.
- `Chalkboard` (slate + wooden frame + `font-chalk chalk-text`) for the few most important things
  (payout recommendation, fixed-cost checklist). Don't turn every card into a board.
- Headings: `font-chalk` (Caveat Brush). Body and numbers: Nunito (`font-sans`, `tabular-nums`).
- `Mascot` (cloud from the logo) for empty, loading and error states. Logo files in `public/brand/`.
- Czech copy uses informal "ty" (tykání), short and human.
- Dates always zero-padded: `06.11.`, with year `06.11.2026` (`dd.MM.` / `dd.MM.yyyy`) — use `weekUtils` formatters.
- Show only the shop's open days (settings `open_days`) in day lists; weekend records still count to their week.
- shadcn primitives stay close to default; style through tokens and `className`.

---

## Tech stack

Mirrors the **stack and code structure** of `/Users/tomastr/React/benefit-ng-react` (Tomáš reviews both; the code should feel the same — the UI should not). When in
doubt, copy the pattern from there (its `CLAUDE.md` is the detailed reference) — minus tenants, MSAL, Orval
and i18n.

| Area     | Choice                                                                           |
| -------- | -------------------------------------------------------------------------------- |
| Runtime  | React 19, TypeScript (`strict`, `verbatimModuleSyntax`)                          |
| Bundler  | Vite, path alias `@/` → `src/`, React Compiler (`babel-plugin-react-compiler`)   |
| Routing  | TanStack Router **file-based** (`src/routes`, generated `src/routeTree.gen.ts`)  |
| Data     | Supabase (`@supabase/supabase-js`) + TanStack Query; no custom backend           |
| DB types | `supabase gen types typescript` → `src/types/supabase.gen.ts`                    |
| Forms    | react-hook-form + Zod 4 + `@hookform/resolvers` + `HookForm` / `HF*`             |
| UI       | Tailwind CSS v4 + shadcn **new-york / zinc** (Radix) + lucide-react              |
| Charts   | recharts via shadcn `Chart` (load the `dataviz` skill before writing chart code) |
| Dates    | date-fns with `cs` locale; weeks are ISO (Mon–Sun)                               |
| Toasts   | Sonner, **only** via `@/lib/toast`                                               |
| Auth     | Supabase Auth, Google OAuth, email allowlist enforced by RLS                     |

No test stack unless asked. Money/week logic lives in pure functions in `src/utils/` so it is easy to review.

---

## Non-negotiables (code)

1. **Never hand-edit generated files:** `src/routeTree.gen.ts`, `src/types/supabase.gen.ts`.
2. **Never hardcode query keys.** Use the `queryKeys` factory in `src/api/queryKeys.ts`.
3. **Never `toast` from `sonner`.** `import { toast } from '@/lib/toast'`.
4. **Never `function Component()`.** Components are arrow functions.
5. **Never invent a second form system.** `FormProvider` + `HookForm` + `HFField` / `HF*`.
6. **No `useMemo` / `useCallback` by default** — React Compiler is on.
7. **No `any`** without an eslint-disable and a real reason.
8. **No money math in components.** Use the functions in `src/utils/` (`envelopeUtils`, `recommendationUtils`, …).
   Amounts are `numeric(12,2)` in DB; format with `moneyUtils`.
9. **Every computed number in the UI must be explainable** via the "Jak se to počítá" pattern (`HowCalculated`).

---

## Structure and naming

```
src/
  api/              supabaseClient.ts, queryKeys.ts, one file per table (queries + mutations)
  components/       shared components, folder-per-component (Name/Name.tsx)
    ui/             shadcn primitives: ui/<Name>/<Name>.tsx, named exports, barrel ui/index.ts
    HookForm/       HookForm, HFField, HF* inputs, HFSubmit
  hooks/            global hooks (default export)
  lib/              toast.ts, utils.ts (cn)
  pages/<Feature>/<Screen>/
    <Screen>.tsx    default export
    comps/          child components (not "components/"), nested as needed, comps/index.ts barrel
    hooks/
  routes/           thin file routes → component imported from pages
  types/            supabase.gen.ts (generated) + hand-written types
  utils/            pure functions: weekUtils, fixedCostUtils, envelopeUtils, recommendationUtils,
                    alertsUtils, moneyUtils
supabase/
  migrations/       additive SQL migrations (schema + RLS)
docs/DESIGN.md      product spec
```

| Kind                     | Convention                                                               |
| ------------------------ | ------------------------------------------------------------------------ |
| Page / feature component | `const X = (...) =>` + **default export**                                |
| `ui/` primitives         | **named** exports                                                        |
| Props                    | local `type Props = { ... }`                                             |
| Hooks                    | `useX`, default export                                                   |
| Barrel                   | `export { default as X } from './X/X'`                                   |
| Imports                  | `@/` across features, relative inside a feature, `import type` for types |

## Formatting

Prettier: `semi: false`, `singleQuote: true`, `jsxSingleQuote: true`, `trailingComma: 'es5'`,
`printWidth: 100`, `tabWidth: 2`, `arrowParens: 'avoid'`.
ESLint: arrow components, `jsx-boolean-value: never`, `jsx-curly-brace-presence: never`,
`jsx-sort-props` (shorthand first, callbacks last), `self-closing-comp`, `arrow-body-style: as-needed`.

Comments explain **why**, not what.

---

## Commands

```bash
npm install
npm run start        # vite dev server on :3000 (needs .env.local, see .env.example)
npm run build        # vite build && tsc
npm run compile      # tsc --noEmit
npm run lint
npm run lint:fix
npm run check        # prettier --write . && eslint --fix
npm run db:types     # regenerate src/types/supabase.gen.ts from the linked project (read-only)
npm run db:backup    # pg_dump of the production DB into backups/ (read-only, needs .env.db)
```

Supabase CLI is a dev dependency (`npx supabase …`). Allowed for you: `migration new`, `gen types`,
`migration list`. **Not** allowed without the user's explicit go-ahead for that specific migration:
`db push` / `migration up` (`.claude/settings.json` asks first). Never: `db reset`, seeds, `psql`.

Before calling work done: `npm run compile`, `npm run lint`, and `npx prettier --check .` must pass.

---

## Git

- Commit only when asked. Branch off `main` for work.
- Never commit `.env*` (except `.env.example`), backups, or credentials.
