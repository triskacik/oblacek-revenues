# Obláček

Týždenný prehľad tržieb a výdajov Sárinho obchodu. Zadanie a model peňazí:
[docs/DESIGN.md](docs/DESIGN.md). Pravidlá pre vývoj (aj pre agentov): [CLAUDE.md](CLAUDE.md).

> ⚠️ Appka pracuje s **jedinou, produkčnou databázou**. Dáta sa nikdy nemažú ani neprepisujú,
> migrácie sú iba aditívne a pred každou sa robí záloha (`npm run db:backup`).

## Spustenie

```bash
npm install
cp .env.example .env.local   # doplniť URL a anon kľúč zo Supabase
npm run start                # http://localhost:3000
```

Port 3000 musí byť voľný: je nastavený ako povolená adresa pre návrat z Google prihlásenia.

## Nastavenie Supabase

Jednorazovo, pred prvým použitím.

1. **Projekt:** na [supabase.com](https://supabase.com) vytvoriť projekt (región EU, napr.
   Frankfurt). Heslo k databáze uložiť do správcu hesiel.
2. **Prepojenie CLI:**
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   ```
3. **Schéma:** prečítať `supabase/migrations/20261109120000_initial_schema.sql`, potom
   ```bash
   npx supabase db push
   ```
4. **Google OAuth:** v [Google Cloud Console](https://console.cloud.google.com/):
   - _APIs & Services → OAuth consent screen_: External, názov „Obláček“. Pokiaľ je v režime
     _Testing_, pridať oba emaily ako test users.
   - _Credentials → Create OAuth client ID → Web application_. Authorized redirect URI:
     `https://<project-ref>.supabase.co/auth/v1/callback`
   - Client ID a Secret vložiť v Supabase do _Authentication → Sign In / Providers → Google_
     a zapnúť.
5. **Návratové adresy:** _Authentication → URL Configuration_: Site URL a Redirect URLs =
   `http://localhost:3000` (neskôr pridať produkčnú adresu).
6. **Kto má prístup:** v _SQL Editor_ spustiť (emaily malými písmenami):
   ```sql
   insert into public.allowed_users (email) values ('sara@…'), ('tomas@…');
   ```
7. **Frontend:** `.env.local` podľa `.env.example`. Hodnoty sú v _Project Settings → API_.
   Iba `anon` / publishable kľúč, nikdy `service_role`.
8. **Prvé prihlásenie:** `npm run start`, prihlásiť sa obaja.
9. **Zatvoriť registrácie:** _Authentication → Sign In / Providers →_ vypnúť _Allow new users to
   sign up_.
10. **Typy:** `npm run db:types` (prepíše bootstrap `src/types/supabase.gen.ts` vygenerovaným).

## Zálohy

```bash
brew install libpq && brew link --force libpq   # pg_dump, jednorazovo
cp .env.db.example .env.db                       # DATABASE_URL (Session pooler) z Supabase → Connect
npm run db:backup                                # → backups/oblacek-<dátum>.dump
```

Záloha iba číta. `backups/` a `.env.db` sú v `.gitignore`, obsahujú reálne dáta a heslo.

## Nasadenie (Vercel)

`vercel.json` rieši SPA routing (všetky cesty → `index.html`), hlavičky (noindex, zákaz iframe)
a dlhú cache pre `/assets`.

1. Vercel → **Add New → Project** → importovať GitHub repo `oblacek-revenues`, production branch
   `main`. Framework, build (`npm run build`) aj output (`dist`) sa načítajú z `vercel.json`.
2. **Environment Variables** (Production aj Preview): `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY` (rovnaké hodnoty ako v `.env.local`). Nikdy nie `service_role`.
3. Deploy. Produkčná adresa napr. `https://oblacek-revenues.vercel.app`.
4. Supabase → **Authentication → URL Configuration**: Site URL = produkčná adresa, do Redirect URLs
   pridať produkčnú adresu (a nechať `http://localhost:3000` na vývoj).
5. Google Cloud → OAuth consent screen: buď **Publish app**, alebo pridať Sárin email do test
   users. Redirect URI v OAuth klientovi sa nemení (je to Supabase callback).
6. Supabase SQL Editor: `insert into public.allowed_users (email) values ('<sarin-email>');`
7. Sára sa prihlási na produkčnej adrese → potom **vypnúť nové registrácie**
   (Authentication → Sign In / Providers → Allow new users to sign up).

Každý push do `main` sa nasadí automaticky; ostatné vetvy dostanú preview URL (prihlásenie na nich
funguje len po pridaní ich adresy do Redirect URLs, napr. `https://*-triskacik.vercel.app/**`).

### Ikona na ploche iPhonu

V Safari otvoriť produkčnú adresu → **Zdieľať → Pridať na plochu**. Názov „Obláček“ aj ikona
(obláčik z loga na krémovom pozadí) sa doplnia samé (`apple-touch-icon`, `apple-mobile-web-app-title`,
`manifest.webmanifest`). Appka sa otvára vo vlastnom okne bez lišty Safari. Prihlásenie sa v nej
drží zvlášť od Safari, takže sa treba raz prihlásiť priamo v appke z plochy.

## Notifikácie (push)

Pripomienky na telefón aj laptop (čo chodí a kedy: `docs/DESIGN.md` → Notifikácie). Všetko je
zadarmo: Web Push (Apple/Google), Supabase Edge Function (free tier 500 000 volaní za mesiac, cron
ich spotrebuje asi 3 000) a `pg_cron` + `pg_net` v databáze. Migrácia
`20261112120000_push_notifications.sql` pridala tabuľky aj naplánovaný job a
`20261113120000_push_muted_kinds.sql` prepínače druhov; obe musia byť spustené pred nasadením funkcie.

1. **Kľúče** (lokálne, nikam ich nevkladaj, privátny kľúč nepatrí do gitu ani do chatu):

   ```bash
   npx web-push generate-vapid-keys
   ```

   ```bash
   openssl rand -hex 32
   ```

   Prvý príkaz vypíše verejný a privátny VAPID kľúč, druhý náhodný `CRON_SECRET`.

2. **Secrets pre Edge Function** (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` a `SUPABASE_ANON_KEY`
   dostane funkcia automaticky):

   ```bash
   npx supabase secrets set VAPID_PUBLIC_KEY=<verejny> VAPID_PRIVATE_KEY=<privatny> VAPID_SUBJECT=mailto:<tvoj-email> CRON_SECRET=<cron-secret>
   ```

3. **Nasadiť funkciu:**

   ```bash
   npx supabase functions deploy send-notifications --no-verify-jwt
   ```

4. **Vault** (Supabase SQL Editor), odkiaľ si cron berie adresu funkcie a rovnaký `CRON_SECRET`:

   ```sql
   select vault.create_secret('https://<project-ref>.supabase.co/functions/v1', 'oblacek_functions_url');
   select vault.create_secret('<cron-secret>', 'oblacek_cron_secret');
   ```

5. **Frontend:** do `.env.local` aj do Vercel Environment Variables pridať
   `VITE_VAPID_PUBLIC_KEY=<verejny>` a znova nasadiť.

6. Na každom zariadení: **Nastavení → Upozornění → Zapnout**, potom **Poslat zkoušku**. iPhone len
   v appke pridanej na plochu (iOS 16.4+), Android v Chrome (stačí stránka, alebo Pridať na plochu),
   počítač v ľubovoľnom modernom prehliadači.

Kontrola, či cron beží (iba čítanie):

```sql
select status, return_message, start_time from cron.job_run_details order by start_time desc limit 5;
select status_code, content, created from net._http_response order by created desc limit 5;
```

Logy funkcie: Supabase → Edge Functions → `send-notifications` → Logs. Každá pripomienka ide von raz
(kľúč v `notification_log`); zariadenie, ktoré upozornenia zrušilo, sa samo vymaže.
