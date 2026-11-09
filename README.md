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
