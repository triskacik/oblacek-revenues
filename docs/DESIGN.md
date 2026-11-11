# Obláček — týždenný prehľad príjmov a výdajov

Jednoduchá appka pre Sáru (malý obchod s potravinami), ktorá nahrádza týždennú Excel tabuľku.
**Nie je to účtovníctvo.**

> _„Otvorím appku a zadávam náklady a tržby alebo príjem zo Zásilkovny, vidím aktuálny týždeň
> a na konci týždňa viem, koľko si môžem dovoliť zaplatiť predavačke tak, aby mi zostalo niečo
> na nákupy cez víkend a na fixné mesačné náklady. Viem, koľko peňazí mám odložených, a vidím,
> či náhodou nie som v strate a či mi zostane na zaplatenie fixných výdajov.“_ — Sára

Cieľ: prehľad, ktorému **verí** a v ktorom sa **nestratí**. Nemusí sa ho učiť.

- Používateľ: **iba Sára** (jeden účet, žiadne role).
- **Primárne MacBook** (veľký displej, pekné prehľady a grafy), plne použiteľné aj na **mobile**.
- UI v **češtine**, mena **CZK**, nie je platiteľka DPH.
- Všetko sa zadáva **ručne**. Dotykačka až neskôr (viď [Neskôr](#neskôr)).

---

## Ako to funguje (celý model)

Peniaze obchodu sú v dvoch „obálkach“:

| Obálka               | Na čo                 | Plní sa                                            | Ubúda                                                       |
| -------------------- | --------------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| **Na fixní náklady** | nájom, služby…        | uzávierkou týždňa (odporučený diel) + _Zásilkovna_ | odškrtnutím fixného nákladu ako _zaplacený_ (môže ísť do −) |
| **Na nákupy**        | tovar na ďalší týždeň | uzávierkou týždňa (koľko si Sára chce nechať)      | výdajmi ďalšieho týždňa                                     |

**Peníze obchodu = obálka na fixní + obálka na nákupy.**

Každý týždeň:

```
k dispozici        = na nákupy z minulého týdne + tržby − výdaje
  − do obálky na fixní      (appka odporučí, aby sa fixné náklady mesiaca stihli pokryť)
  − na nákupy si nechávám   (Sára zadá: tento týždeň 3 000, iný 1 000…)
  − vzala jsem si           (zvyčajne 0)
  = můžu vyplatit prodavačce
```

Výdaje (vrátane víkendového nákupu tovaru) sa zapisujú normálne k dátumu. Tým, že obálka
„na nákupy“ prechádza do ďalšieho týždňa ako _k dispozici_, sa nič neráta dvakrát: keď nakúpi
za 3 000, tieto výdaje ubudnú z _k dispozici_ a rezerva ich vyrovná. Čo neminie, zostane jej
v ďalšom týždni a predavačka môže dostať viac.

---

## Splňa to Sárinu vetu?

| Sára chce                                                        | Kde to je                                                                                                         |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| zadávať náklady, tržby, príjem zo Zásilkovny                     | tlačidlo **+ Přidat** všade (Výdaj / Tržba / Zásilkovna), dátum predvolene dnes                                   |
| vidieť aktuálny týždeň                                           | appka sa otvorí na aktuálnom týždni                                                                               |
| vedieť, koľko zaplatiť predavačke, aby zostalo na nákupy a fixné | hlavná karta: _„Na nákupy si chci nechat [3 000] → prodavačce doporučuji vyplatit 4 000 Kč“_                      |
| vedieť, koľko má odložené                                        | _Peníze obchodu_ rozdelené na _odloženo na fixní_ a _na nákupy_                                                   |
| vidieť, či nie je v strate                                       | prebytok týždňa a **výsledok mesiaca** (zelená / červená), graf vývoja                                            |
| vidieť, či zostane na fixné výdaje                               | _„Na fixní náklady listopadu chybí ještě 6 000 Kč — zbývají 2 týdny, tj. 3 000 Kč týdně“_ + checklist zaplatených |

---

## UX zásady

- **Hlavné čísla navrchu, čisto a veľko.** Odporúčaná výplata, peniaze obchodu, stav fixných nákladov.
- **Každé vypočítané číslo ide rozkliknúť** na „Jak se to počítá“: pár riadkov obyčajnou češtinou.
  Dôvera vzniká tak, že vidí výpočet, nie vysvetľovaním vopred.
- **Nič sa nezamyká, ale nič sa nemení potichu.** Zmeny v minulosti sú dovolené a viditeľné.
- **Upozornenia iba na to, čo treba urobiť** (uzavrieť, zaplatiť, doplniť), max. pár naraz.
- **Laptop = dashboard** (viac stĺpcov, grafy, všetko podstatné bez scrollovania).
  **Mobil = rýchle zapisovanie** (spodná lišta, karty pod sebou, pridať záznam = 2 ťuknutia).

## Vizuálny štýl

Appka je pre Sáru (26), nie pre účtovníka. Má pôsobiť **priateľsky, mierne „cute“ a pokojne** a
nesmie ju **stresovať**. Vizuál nemusí pripomínať `benefit-ng-react`, z neho sa preberá iba stack
a štruktúra kódu.

- **Jedna svetlá téma, žiadny dark mode.** Pozadie je krémové ako logo (`#f9f3e8`).
- **Farby z loga**: olivová (písmo loga) pre text a primárne prvky, terakota (košík) pre akcenty,
  doplnkovo béžová, šalviová, medová a „líčka“ (blush). Tokeny sú v `src/styles.css`.
- **Žiadna červená** (jediná výnimka: výsledok mesiaca na stránke Mesiac, zelený/červený). Strata alebo chýbajúce peniaze sú terakotové a s podporným textom
  („Tento týden se tolik nedařilo, chybí 1 200 Kč. To se stává, dorovná to další týden.“).
  `destructive` je iba pre skutočné chyby appky.
- **Logo a maskot**: logo v hlavičke a na prihlásení; obláčik z loga (`public/brand/mascot.png`)
  v prázdnych stavoch, pri načítaní a na chybových stránkach.
- **Kriedové tabule**: najdôležitejšie veci (odporúčaná výplata, checklist fixných nákladov) sú
  ako tabuľa v obchode: tmavá bridlica v drevenom ráme, biele kriedové písmo (`Chalkboard`).
  Tabule sú vzácne, nie všade.
- **Písma**: _Caveat Brush_ (krieda / ručne písané) na nadpisy a tabule, _Nunito_ (zaoblené,
  čitateľné) na všetko ostatné a na čísla.
- **Shadcn** komponenty ostávajú skoro defaultné, vzhľad dávajú tokeny, zaoblenie a farby.
- **Dátumy** vždy s nulami: `06.11.`, s rokom `06.11.2026` (`dd.MM.` / `dd.MM.yyyy`).
- **Žiadne dlhé pomlčky** (`—`, `–`) v UI, iba obyčajné `-` alebo `-` s medzerami
  (`- Kč`, `02.11. - 06.11.2026`).
- **Kurzor ruky** na všetkom klikateľnom.
- **Výber dátumu, mesiaca a času** cez vlastné pickery (kalendár, mriežka mesiacov, mriežka hodín
  a štvrťhodín), nie natívne políčka prehliadača.
- Návrat na aktuálne obdobie je secondary tlačidlo s ikonou a textom **„Skočit na aktuální týden / měsíc“**, aby nepôsobilo ako odznak.
- **Tón textov**: tykanie, krátko, ľudsky („Zatím v klidu“, „Mrkneme, jak se obchodu daří?“).
- **Layout**: hlavička s logom a „pilulkovou“ navigáciou na desktope (bez sidebaru), plávajúca
  spodná lišta na mobile.

---

## Pojmy

| Pojem (UI, cs)            | Význam                                                                                                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Týden**                 | Dáta: Pondelok–Nedeľa (ISO, `2026-W46`), mesiacu patrí podľa štvrtka. UI ukazuje iba **otváracie dni**; víkendový nákup sa normálne započíta do týždňa.                                                                              |
| **Otváracie dni**         | Dni v týždni, keď je obchod otvorený (Nastavenia, teraz Po–Pá). Iba pre ne sa čaká tržba.                                                                                                                                            |
| **Koniec pracovnej doby** | Jeden čas pre všetky dni (napr. 18:00). Až potom appka čaká dnešnú tržbu.                                                                                                                                                            |
| **Koniec týždňa**         | Koniec pracovnej doby v poslednom otváracom dni týždňa (teraz piatok).                                                                                                                                                               |
| **Tržba**                 | Peniaze z predaja za deň (`0` = zavřeno).                                                                                                                                                                                            |
| **Výdaj**                 | Čokoľvek zaplatené z peňazí obchodu (tovar, drobnosti…). Fixné náklady sa sem nezadávajú.                                                                                                                                            |
| **Přebytek týdne**        | `tržby − výdaje` za týždeň. Záporný = ztráta.                                                                                                                                                                                        |
| **Zásilkovna**            | Mesačná faktúra za výdajné miesto. Príjem mimo pokladne za **mesiac**, ide do obálky na fixní. Technicky „jiný příjem“ (`other_incomes.kind = 'zasilkovna'`), aby sa dali neskôr pridať ďalšie druhy; v UI je zatiaľ iba Zásilkovna. |
| **Fixní náklady**         | Mesačné náklady, suma platná od mesiaca X, deň splatnosti. Každý mesiac sa odškrtávajú ako _zaplacené_.                                                                                                                              |
| **Uzávěrka týdne**        | Rozdelenie _k dispozici_: výplata, do obálky na fixní, na nákupy, vzala jsem si                                                                                                                                                      |
| **Výsledek měsíce**       | `přebytky + Zásilkovna − výplaty − vzala si − fixní náklady měsíce`. Zarobil obchod, alebo prerobil?                                                                                                                                 |

---

## Výpočty

Čisté TS funkcie v `src/utils/` (pár stoviek riadkov ročne, počíta sa na klientovi).

### Uzávierka týždňa T

```
přebytek(T)     = Σ tržby(T) − Σ výdaje(T)                          (podľa dátumu)
k dispozici(T)  = na nákupy(T−1) + přebytek(T)

uloží sa:  seller_payout, to_fixed (do obálky na fixní), owner_take, surplus_at_close
na nákupy(T)    = k dispozici(T) − seller_payout − to_fixed − owner_take     (dopočíta sa)
```

„Na nákupy“ sa vždy dopočíta zo živých dát. Prvý týždeň: `na nákupy(T−1)` = počáteční stav
obálky na nákupy (Nastavení).

### Obálky

```
odloženo na fixní = počáteční stav (fixní)
                  + Σ to_fixed uzavretých týždňov
                  + Σ Zásilkovna
                  − Σ zaplacené fixní náklady

na nákupy         = na nákupy(posledný uzavretý týždeň)
peníze obchodu    = odloženo na fixní + na nákupy
```

Otvorený týždeň do obálok ešte nevstupuje; na karte je zvlášť „tento týden zatím +3 200 Kč“.

### Odporúčanie

```
M               = mesiac týždňa T
chybí na fixní  = max(0, nezaplacené fixní náklady do M (vrátane) − odloženo na fixní)
zbývá týdnů     = týždne M od T do konca (vrátane)
N               = na nákupy si chci nechat (zadá Sára; predvolene priemer výdajov za posledné
                  4 týždne zaokrúhlený nahor na stovky, hneď po otvorení za menej týždňov,
                  pred prvým týždňom počiatočný stav; nikam sa neukladá)

doporučeno do obálky = clamp(chybí na fixní / zbývá týdnů, 0, max(0, k dispozici))
doporučeno vyplatit  = max(0, k dispozici − doporučeno do obálky − N)
```

- Karta týždňa má pole **„Na nákupy si chci nechat“** a odporúčanie sa prepočíta hneď pri písaní.
- Funguje to aj opačne: **kliknutím na sumu výplaty** ju Sára prepíše a „na nákupy“ sa dopočíta
  (k dispozícii - na fixné - výplata). „Vrátit doporučení“ vráti pôvodný návrh.
- Keď `k dispozici − do obálky < N`: výplata 0 a _„Na nákupy zůstane jen 1 800 Kč místo 3 000 Kč“_.
- **Uzavrieť týždeň ide až keď má každý otvárací deň tržbu** (zatvorené = `0`). Dovtedy tabuľa
  ukazuje, za ktoré dni ešte chýba.
- Je jedno, kedy v mesiaci nájom zaplatí: zaplatenie zníži _odloženo_ aj _nezaplacené_ o rovnakú
  sumu, takže _chybí_ sa nezmení. Prebytok obálky z minulých mesiacov _chybí_ znižuje, mínus zvyšuje.
- Výrazná od posledného otváracieho dňa týždňa (teraz piatok) a pre každý minulý neuzavretý týždeň.
  Uzávierka sa ňou predvyplní.

#### Overenie (nájom 12 000 splatný 5., 4 týždne, přebytek 8 000/týždeň, N = 2 000, štart od 0)

| Týž. | Na nákupy z min. | K dispozici | Odloženo pred  | Chybí  | Do obálky | Výplata   | Na nákupy | Odloženo po |
| ---- | ---------------- | ----------- | -------------- | ------ | --------- | --------- | --------- | ----------- |
| 1    | 0                | 8 000       | 0              | 12 000 | 3 000     | **3 000** | 2 000     | 3 000       |
|      |                  |             | _05.11. nájom_ |        |           |           |           | −9 000      |
| 2    | 2 000            | 10 000      | −9 000         | 9 000  | 3 000     | **5 000** | 2 000     | −6 000      |
| 3    | 2 000            | 10 000      | −6 000         | 6 000  | 3 000     | **5 000** | 2 000     | −3 000      |
| 4    | 2 000            | 10 000      | −3 000         | 3 000  | 3 000     | **5 000** | 2 000     | **0**       |

Prvý týždeň je výplata nižšia, lebo sa ešte len tvorí rezerva na nákupy. Na konci mesiaca je
nájom pokrytý a na nákupy ostáva 2 000.

---

## Zadávanie spätne

Každý záznam má **dátum, kedy sa to stalo**, nie kedy ho zapísala. Modály majú predvolene _dnes_.
Zásilkovna má namiesto dátumu **mesiac**.

| Situácia                                                  | Ako appka reaguje                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Budúcnosť / pred počátečním stavem**                    | Nedovolené.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Do otvoreného minulého týždňa**                         | Bez otázok. Toast: „Uloženo do týdne 45 (02.11. - 06.11.)“.                                                                                                                                                                                                                                                                                                                                                                                       |
| **Do uzavretého týždňa**                                  | Povolené. Výplata ani obálka na fixní sa nemenia; rozdiel ide z/do _na nákupy_ toho týždňa (a teda do ďalších týždňov). Týždeň ukáže priateľskú poznámku _„Po uzávěrce jsi nakoupila za 1 500 Kč, z peněz na nákupy zbývá 500 Kč.“_ (nové výdaje sa poznajú podľa času zápisu po uzávierke; iné zmeny dostanú všeobecnú vetu). Typicky víkendový nákup po piatkovej uzávierke, čo je v poriadku. Upozornenie iba ak tým _na nákupy_ klesne pod 0. |
| **Zásilkovna za minulý mesiac** (za říjen, zadaná 15.11.) | „Za měsíc: říjen“ (rýchla voľba _minulý měsíc_). Obálka na fixní narastie hneď, aktuálne odporúčanie sa zvýši.                                                                                                                                                                                                                                                                                                                                    |
| **Fixný náklad zaplatený za minulý mesiac**               | Checklist ide prepnúť na ľubovoľný mesiac.                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Zmena / zmazanie záznamu**                              | Rovnaké pravidlá; zmazanie v uzavretom týždni s potvrdením.                                                                                                                                                                                                                                                                                                                                                                                       |

Keď spätný záznam zmení obálky, zmení sa aj aktuálne odporúčanie. „Jak se to počítá“ ukáže prečo.

---

### Rýchle zapisovanie a poistky

- **Tržba dnes priamo v riadku dňa:** pri dnešnom dni bez tržby je namiesto tlačidla pole
  „Tržba dnes“ (Enter alebo fajka uloží). Modál zostáva na poznámky a opravy.
- **Návrhy poznámok pri výdaji:** pod poznámkou najčastejšie poznámky za posledných 90 dní
  („Makro“, „Pekárna“…), ťuk ich vyplní (`noteUtils.ts`).
- **„Vrátit“ po zmazaní:** po zmazaní tržby, výdaja alebo Zásilkovny ponúkne toast 10 sekúnd
  tlačidlo Vrátit, ktoré záznam vloží späť presne ako bol (rovnaké id aj `created_at`).

### Měsíc hotový

`getMonthChecklist()` v `trackerUtils.ts`, kriedová tabuľa navrchu stránky **Mesiac**, len pre
**skončený mesiac** a **posledný týždeň** aktuálneho. Zoznam na odškrtanie: tržby za všetky
otváracie dni, všetky týždne uzavreté, fixné náklady zaplatené, Zásilkovna zapísaná (alebo jej
upozornenie skryté = „tento měsíc není“), každá položka s tlačidlom, ktoré to vyrieši. Keď je
všetko hotové, tabuľa sa zmení na oslavu s obláčikom: **„Listopad je hotový!“**, vyplatené
predavačke a čo obchodu zostalo.

## Upozornenia

`getAlerts()` v `src/utils/alertsUtils.ts`, panel **„Co je potřeba udělat“**. Iba veci, ktoré treba
**urobiť** alebo **skontrolovať**. Ako ide mesiac (pokrytie, blížiace sa splatnosti, peniaze) ukazuje
[Prehľad mesiaca](#prehľad-mesiaca). Úrovne bez červenej: `info` (šalviová), `todo` (medová),
`important` (terakota). Keď nie je čo robiť, panel sa vôbec neukáže.

**Úlohy** (nedajú sa skryť, sú potrebné pre správne čísla):

| Upozornenie                                     | Kedy                                                                            | Úroveň    |
| ----------------------------------------------- | ------------------------------------------------------------------------------- | --------- |
| **Zadej, kdy obchod otevřel**                   | chýba `opening_date` (vtedy je to jediné upozornenie)                           | important |
| **Chybí tržba** „Chybí tržby za 03.11., 05.11.“ | otvárací deň od `opening_date` bez tržby; **dnešok až po konci pracovnej doby** | todo      |
| **Týden 45 skončil**                            | po konci pracovnej doby posledného otváracieho dňa, bez uzávierky               | todo      |
| **Nezaplaceno za listopad: Nájem**              | fixný náklad **po splatnosti** alebo za **skončený mesiac** a neodškrtnutý      | important |

**Kontroly** („Je to správně?“, Sára ich môže **skryť**; skryté sú v tabuľke `dismissed_alerts`,
zdieľané pre oboch používateľov, v Nastaveniach sa dajú zobraziť znova):

| Upozornenie                                | Kedy                                                             | id                       |
| ------------------------------------------ | ---------------------------------------------------------------- | ------------------------ |
| **Přidej fixní náklady**                   | nie je zadaný žiadny fixný náklad                                | `setup-fixed-costs`      |
| **Týden 45 nemá žádný výdaj**              | skončený týždeň s tržbami a bez jediného výdaja                  | `no-expenses-<pondelok>` |
| **Na 03.11. jsou zapsané 2 tržby**         | viac tržieb v jeden deň (preklep, alebo hotovosť a karta zvlášť) | `duplicate-sales-<deň>`  |
| **Za říjen ještě není zapsaná Zásilkovna** | mesiac skončil a Zásilkovna k nemu nie je                        | `zasilkovna-<yyyy-MM>`   |
| **Po uzávěrce víc výdajů než rezerva**     | _na nákupy_ uzavretého týždňa < 0                                | `reserve-<pondelok>`     |

Do Prehľadu mesiaca sa presunulo: blížiaca sa splatnosť, „na fixné náklady bude chýbať“ a manko
z minulého mesiaca.

## Notifikácie

Push upozornenia na zariadenia, kde ich niekto zapol (Nastavení → Upozornění, pre každé zariadenie
zvlášť, chodia na všetky zapnuté zariadenia Sáry aj Tomáša). Iba tieto štyri, nič iné:

| Notifikácia                       | Kedy (čas v Prahe)                                                                       | Kľúč v `notification_log` |
| --------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------- |
| **Nezapomeň zapsat dnešní tržbu** | otvárací deň od `opening_date`, od `settings.reminder_time` (20:00), dnes ešte bez tržby | `sale-<deň>`              |
| **Týden 46 skončil** „uzavři ho“  | sobota od 19:00, týždeň má otváracie dni a nie je uzavretý                               | `close-<pondelok>`        |
| **Týden 46 nemá žádný výdaj**     | nedeľa od 19:00, týždeň má tržby a žiadny výdaj, kontrola nie je skrytá                  | `noexp-<pondelok>`        |
| **Zítra je splatný Nájem**        | večer pred splatnosťou (od 19:00), len náklad so splatnosťou, aktívny a ešte nezaplatený | `due-<id nákladu>-<deň>`  |

- Čas pripomienky tržby sa dá zmeniť v Nastaveniach, ostatné časy sú pevné.
- Každý druh sa dá **pre dané zariadenie vypnúť** prepínačom v Nastaveniach (`push_subscriptions.muted_kinds`: `sale`, `close`, `noexp`, `due`; predvolene chodí všetko). Skúška chodí vždy.
- V notifikácii **nie sú sumy** (vidno ju na zamknutej obrazovke). Ťuknutie otvorí správny týždeň
  alebo mesiac.
- Každá ide von raz: po odoslaní sa zapíše kľúč do `notification_log` (aj keď nie je zapnuté žiadne
  zariadenie, aby neskôr nechodili staré pripomienky).
- Technicky: `pg_cron` každých 15 minút cez `pg_net` zavolá Edge Function `send-notifications`
  (hlavička `x-cron-secret`, adresa a secret sú vo Vault). Funkcia číta dáta cez service role, rozhodne
  podľa pravidiel vyššie a pošle Web Push (VAPID). Dáta obchodu nikdy nemení. Zariadenie s odpoveďou
  404/410 sa zo `push_subscriptions` vymaže. Zariadenie: `public/sw.js` (iba notifikácie, žiadna
  offline cache), `src/lib/push.ts`, `src/api/pushSubscriptions.ts`.
- **Poslat zkoušku** v Nastaveniach: tá istá funkcia s tokenom prihláseného používateľa (overí
  `is_allowed_user()`), pošle len na toto zariadenie.
- iPhone: len appka pridaná na plochu (iOS 16.4+); Nastavenia to vysvetlia.
- Všetko na free tieroch (Web Push je zadarmo, Edge Functions 500 000 volaní za mesiac).
- Nastavenie kľúčov: `README.md` → Notifikácie.

## Prehľad mesiaca

`getMonthTracker(ledger, today, month?)` v `src/utils/trackerUtils.ts` (texty v
`trackerTextUtils.ts`). Dve podoby, aby bol stav stále na očiach a nič sa neopakovalo:

**1. Ukazovateľ v hlavičke** (`HeaderTracker`, na každej stránke, desktop aj mobil):
krúžok, ktorého oblúk ukazuje pokrytie fixných nákladov aktuálneho mesiaca; v strede **fajka**
(odkladá včas alebo pokryté, šalviová), **výkričník** (trochu pozadu, medový) alebo pomlčka (bez
fixných nákladov), číslo sa nezobrazuje a terakotové koliesko s počtom úloh. Na desktope vedľa
toho „Listopad · Odkládáš včas“. Klik otvorí detail: mesiac a stav, pás pokrytia s týždňami, veta
o stave, zaplatené platby, **peniaze obchodu a na nákupy (teraz)** a čo čaká. Odkazy „Vyřídit
úkoly“ (aktuálny týždeň) a „Detail měsíce“.

**2. Karta na stránke Mesiac** (`MonthOverviewCard`, pre zobrazený mesiac, aj minulé/budúce):
„Fixní náklady“ + odznak **Pokryto / Odkládáš včas / Trochu pozadu** (pri skončenom mesiaci
„Něco chybělo“), percento a „odloženo X z Y“, pás so zárezom na každý týždeň a terakotovou
značkou plánu, bodky týždňov (uzavretý ✓, neuzavretý medovo, aktuálny terakotovo), veta o stave
a prebytok/manko z minula. Pod tým čísla mesiaca: tržby (s tempom oproti minulému mesiacu),
výdaje, prodavačce a **Měsíc zatím / celkem** s „Jak se to počítá“ (nahradili samostatné
dlaždice).

Pravidlá:

- Pokrytie počíta iba odložené peniaze (uzávierky + Zásilkovna) mínus fixné náklady minulých
  mesiacov, takže neskáče pri zaplatení.
- „Odkládáš včas“ = odložené ≥ mesačné fixné × skončené týždne / týždne mesiaca, teda na konci
  mesiaca bude na fixné náklady dosť.
- Obdobie len „Ještě 2 týdny do konce měsíce“ / „Poslední týden měsíce“.
- **Měsíc zatím / celkem** je zelené (≥ 0) alebo červené (< 0) cez tokeny `--positive` /
  `--negative`, jediná výnimka z „žiadnej červenej“ (výslovné prianie Tomáša).
- Týždeň už nemá samostatnú kartu peňazí ani veľký prehľad; stav mesiaca je v hlavičke.

----------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------- |
| **Neuzavřený týden** „Týden 45 není uzavřený“ | minulý týždeň bez uzávierky | warning |
| **Nezaplaceno** „Nájem 12 000 Kč, splatnost 5. 11.“ | fixný náklad mesiaca neodškrtnutý | info → danger po splatnosti |
| **Fixní náklady se nepokryjí** „Do konce listopadu chybí 2 000 Kč“ | v poslednom týždni mesiaca `chybí > k dispozici` | danger |
| **Rezerva na nákupy v mínusu** „Týden 44: výdaje po uzávěrce překročily rezervu o 500 Kč“ | _na nákupy_ uzavretého týždňa < 0 | warning |
| **Chybí tržba** „Chybí tržba za: Po, St“ | minulý deň týždňa bez tržby (odporúčanie je potom nepresné) | info |

---

## Obrazovky

Desktop: **hlavička** s logom, pilulkovou navigáciou (Týden · Měsíc · Přehled) a menu používateľa (Nastavení, Odhlásit) + obsah v gride.
Mobil: **spodná lišta** _Týden · Měsíc · [+] · Přehled_, obsah v jednom stĺpci.
**+ Přidat** (header na desktope, [+] na mobile) → _Výdaj / Tržba / Zásilkovna_.

### Týden (`/week/$weekId`, hlavná)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ◀  Týden 46 · 09.11.–13.11.2026  ▶                         [+ Přidat ▾]    │
├──────────────────────────────────────────┬─────────────────────────────────┤
│ PRODAVAČCE DOPORUČUJI VYPLATIT           │ PENÍZE OBCHODU       14 200 Kč  │
│ 4 000 Kč                                 │  odloženo na fixní    9 000     │
│ Na nákupy si chci nechat [ 3 000 ] Kč    │  na nákupy            5 200     │
│ k dispozici 10 000 − fixní 3 000 − …  ⓘ │  tento týden zatím   +3 200     │
│                       [Uzavřít týden]    │─────────────────────────────────│
├──────────┬──────────┬────────────────────│ FIXNÍ NÁKLADY · listopad        │
│ Tržby    │ Výdaje   │ Přebytek           │  chybí ještě 6 000 (3 000/týd.) │
│ 18 400   │ 8 200    │ +10 200            │  ☑ Nájem 12 000  ☐ Elektřina …  │
├──────────┴──────────┴────────────────────│─────────────────────────────────│
│ [graf: tržby a výdaje po dňoch Po–Ne]    │ UPOZORNĚNÍ                      │
├──────────────────────────────────────────│  • Chybí tržba za St            │
│ Po 09.11.   tržba 2 600 · výdaje 1 200 ▸ │                                 │
│ Út 10.11.   …                            │                                 │
└──────────────────────────────────────────┴─────────────────────────────────┘
```

Poradie podľa priority (na mobile pod sebou): **úlohy → dlaždice týždňa → deň po dni →
odporúčaná výplata → fixné náklady**. Na desktope ľavý stĺpec (úlohy, dlaždice, dni) a pravý
(tabuľa výplaty, fixné náklady). Stav mesiaca a peniaze obchodu sú v ukazovateli v hlavičke.

### Měsíc (`/month/$monthId`)

- Dlaždice: _Tržby, Výdaje, Výplaty, Fixní náklady, Zásilkovna_, **Výsledek měsíce** (zelená/červená).
- **Graf po týždňoch:** stĺpce tržby / výdaje, čiara přebytek, výplata predavačke.
- **Fixné náklady:** checklist _Zaplaceno_ + „odloženo X z Y“ (progress).
- **Zásilkovna** za mesiac (zadaná / + pridať).
- Týždne mesiaca s uzávierkami (klik → týždeň).

### Přehled (`/overview`)

- **Graf posledných 12 mesiacov:** tržby, výdaje, výsledek měsíce.
- **Vývoj peňazí obchodu** (plocha: odloženo na fixní + na nákupy) po týždňoch.
- Súčty od začiatku: vyplatené predavačke, fixné náklady, priemerná týždenná tržba.

### Návod (`/guide`)

Priateľský návod pre Sáru (a referencia pre Tomáša): jej týždeň krok za krokom (tržba každý deň,
výdaje, uzávierka v posledný otvárací deň, víkendový nákup, odškrtnutie fixných nákladov,
Zásilkovna) s vysvetlením _prečo_, ako appka počíta (dve obálky + výpočet na tabuli), čo kde nájde,
na čo upozorňuje a časté otázky. Na desktope pilulka v hlavičke vedľa Přehledu s obsahom v bočnom
stĺpci, na mobile v menu používateľa (spodná lišta nemá miesto).

### Nastavení (`/settings`)

Fixné náklady (názov, suma, splatnosť, „od měsíce X nová částka“, ukončiť = suma 0 od mesiaca X; **zmazať** sa dá len náklad bez jedinej zaplatenej platby, napr. omylom vytvorený)
· **otevírací doba**: zaškrtávanie dní v týždni (Po–Ne, teraz Po–Pá) a jeden čas konca pracovnej
doby · **upozornění**: zapnúť / vypnúť na tomto zariadení, prepínač pre každý druh, poslať skúšku, čas pripomienky tržby
(viď [Notifikácie](#notifikácie)) · počáteční stav (dátum otvorenia, odloženo na fixní, na nákupy).

### Modály

Rovnaké na pridanie aj úpravu: `DatedEntryModal` (výdaj aj tržba), `ZasilkovnaModal` (mesiac namiesto
dátumu, predvolene minulý mesiac, lebo faktúra chodí spätne), `CloseWeekModal` (predvyplnený odporúčaním: na nákupy, výplata, do obálky; _Vzala jsem si_
schované pod „+“; výsledok sa prepočítava živo), `FixedCostModal`.

### Grafy

recharts cez shadcn `Chart` (`ChartCard` = rám s kriedovým nadpisom a legendou). Farby sú tóny
z loga upravené tak, aby prešli kontrolou čitateľnosti aj pre farboslepých (dataviz validátor):
tržby `--chart-1` tmavá terakota, výdaje `--chart-2` medová, peniaze obchodu / kladný výsledok
`--chart-3` olivová. Tenké stĺpce so zaoblením, jemná mriežka, tooltip so sumami v Kč. Kým nie je
dosť dát, graf nahradí priateľská veta.

- **Měsíc:** stĺpce tržby a výdaje po týždňoch.
- **Přehled:** súčty od otvorenia (priemerná týždenná tržba, vyplatené predavačke, zaplatené
  fixné náklady, Zásilkovna), tržby a výdaje po mesiacoch, výsledok mesiacov (nad / pod nulou,
  bežiaci mesiac svetlejšie) a vývoj peňazí obchodu po týždňoch (tooltip rozpíše obe obálky).

## Dáta (Supabase Postgres)

```sql
expenses            (id uuid pk, date date, amount numeric(12,2) > 0,  note text, created_at timestamptz)
sales               (id uuid pk, date date, amount numeric(12,2) >= 0, note text, created_at timestamptz)
other_incomes       (id uuid pk, month date  -- 1. deň mesiaca
                    , kind text not null default 'zasilkovna' check (kind in ('zasilkovna'))
                    , amount numeric(12,2) > 0, note text, created_at timestamptz)

fixed_costs         (id uuid pk, name text, due_day smallint null, sort int, created_at timestamptz)
fixed_cost_amounts  (id uuid pk, fixed_cost_id fk, valid_from date  -- 1. deň mesiaca
                    , amount numeric(12,2) >= 0  -- 0 = od tohto mesiaca zrušený
                    , unique (fixed_cost_id, valid_from))
fixed_cost_payments (id uuid pk, fixed_cost_id fk, month date, paid_at date
                    , unique (fixed_cost_id, month))

week_closings       (week_start date pk  -- pondelok
                    , seller_payout numeric(12,2) >= 0
                    , to_fixed      numeric(12,2) >= 0
                    , owner_take    numeric(12,2) >= 0 default 0
                    , surplus_at_close numeric(12,2) not null
                    , note text, closed_at timestamptz)

settings            (id int pk check (id = 1), opening_date date
                    , opening_fixed numeric(12,2) default 0
                    , opening_purchases numeric(12,2) default 0
                    , open_days smallint[] default '{1,2,3,4,5}'  -- ISO dni, 1 = Po
                    , closing_time time default '18:00'
                    , reminder_time time default '20:00')  -- push o chýbajúcej tržbe
dismissed_alerts    (id text pk, dismissed_at timestamptz)  -- skryté kontroly
push_subscriptions  (id uuid pk, endpoint text unique, p256dh text, auth text
                    , user_email text, user_agent text, created_at timestamptz
                    , muted_kinds text[] default '{}')  -- zariadenia a vypnuté druhy notifikácií
notification_log    (key text pk, sent_at timestamptz)  -- odoslané notifikácie, iba service role
allowed_users       (email text pk)
```

- Suma fixného nákladu pre mesiac M = posledný `fixed_cost_amounts` s `valid_from <= M`.
  Náklad platí od prvého riadku; suma `0` ho ukončí. Počíta sa až od mesiaca `opening_date`.
- Zaplacené = riadok v `fixed_cost_payments`; odpočíta sa suma platná pre daný mesiac.
- `sales` je samostatná tabuľka aj kvôli Dotykačke (neskôr stĺpec `source`).

---

## Bezpečnosť

- **Supabase Auth — Google OAuth.**
- **Prístup: Sára + Tomáš.** Ich emaily sú v `allowed_users`; obaja vidia a môžu meniť **tie isté
  dáta** (žiadne „moje / tvoje“, dáta nie sú viazané na používateľa). Pridať/odobrať človeka =
  riadok v `allowed_users`, bez zmeny kódu.
  Email musí byť Google účet (Gmail alebo Google Workspace). Ak by niekto Google nemal, dá sa
  doplniť prihlásenie magic linkom na email, RLS ostáva rovnaké.
- **RLS na každej tabuľke**: iba ak `auth.jwt() ->> 'email'` je v `allowed_users`. Cudzí sa síce
  prihlási Googlom, ale neuvidí ani nezapíše nič (appka mu ukáže „Nemáte přístup“).
- Po prvom prihlásení Sáry (a Tomáša) → v Supabase **vypnúť nové registrácie**.
- Frontend iba s `anon` (publishable) kľúčom; `service_role` nikdy vo frontende ani v repe.
- Schéma + RLS ako SQL migrácie v `supabase/migrations/`, nie klikaním v dashboarde.

### Jedna produkčná DB — dáta sa nesmú stratiť

Existuje **iba jedna databáza (produkčná)**. Od prvého reálneho záznamu platí:

- Agent (Claude) **nikdy nemení ani nemaže dáta** v DB a nezapisuje do nej testovacie dáta.
- Migrácie sú **iba aditívne** (nová tabuľka/stĺpec s defaultom, nový index, nová policy).
  `DROP`, `TRUNCATE`, `DELETE`, `UPDATE` dát, premenovanie či zmena typu stĺpca len s výslovným
  súhlasom Tomáša a po zálohe.
- Migrácie spúšťa Tomáš (alebo agent s jeho výslovným súhlasom pre konkrétnu migráciu),
  **pred každou migráciou záloha** (`npm run db:backup` → `supabase db dump --data-only` do
  gitignorovaného `backups/`).
- `supabase db reset` a seed skripty proti remote DB sú zakázané.
- Hosting: statický (Vercel / Netlify / Cloudflare Pages).

### Manuálne kroky (Tomáš)

Podrobný postup je v [README.md](../README.md#nastavenie-supabase).

1. Vytvoriť Supabase projekt.
2. Google Cloud Console → OAuth client (Web) → redirect URI zo Supabase → zapnúť Google provider.
3. Spustiť migrácie, vložiť emaily do `allowed_users`, prihlásiť sa, vypnúť sign-ups.
4. `.env.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

---

## Frontend podľa `benefit-ng-react`

**Rovnaké:** React 19, Vite 7, TS strict + `verbatimModuleSyntax`, React Compiler (bez
`useMemo`/`useCallback` by default), TanStack Router file-based, TanStack Query,
react-hook-form + Zod 4 so zjednodušeným `HookForm` / `HFField` patternom,
shadcn **new-york / zinc** v `components/ui/<Name>/<Name>.tsx` + barrel, lucide-react, recharts,
date-fns (`cs`), Sonner iba cez `@/lib/toast`, arrow komponenty, `type Props`,
`pages/<Feature>/<Screen>/comps/`, rovnaký Prettier a ESLint. Vizuál je vlastný (viď Vizuálny štýl).

| benefit-ng-react               | tu                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------- |
| Orval + axios + `generated.ts` | `supabase-js` + `supabase gen types` → `src/types/supabase.gen.ts` (needitovať) |
| `get*QueryKey` z Orvalu        | vlastná fabrika `queryKeys` v `src/api/queryKeys.ts` (žiadne hardcoded kľúče)   |
| tenanty, `TenantLink`, MSAL    | nič z toho, obyčajný `Link` a Supabase session                                  |
| i18next cs/en/pl               | žiadne i18n, texty priamo v češtine                                             |
| `BnfTableWrapped`              | netreba, zoznamy ako karty                                                      |

```
src/
  api/            supabaseClient.ts, queryKeys.ts, expenses.ts, sales.ts, otherIncomes.ts,
                  fixedCosts.ts, fixedCostPayments.ts, weekClosings.ts, settings.ts
  components/     AppHeader, UserMenu, BottomNav, AddMenu, PageHeader, Chalkboard, Mascot,
                  EmptyState, PeriodNav, MoneyInput, StatTile, AlertsPanel,
                  HowCalculated, HookForm/…, ui/
  hooks/          useSession, useLedger (načíta dáta od počátečního stavu)
  lib/            toast.ts, utils.ts (cn)
  pages/
    Week/WeekDetail/       comps/ (RecommendationCard, ShopMoneyCard, FixedCostsCard, WeekTiles,
                                   DailyChart, DayList, CloseWeekModal, AfterCloseNote…)
    Month/MonthDetail/     comps/ (MonthTiles, WeeklyChart, FixedCostChecklist, ZasilkovnaIncome,
                                   MonthWeeks…)
    Overview/OverviewPage/ comps/ (MonthlyTrendChart, ShopMoneyChart, Totals)
    Settings/SettingsPage/ comps/ (FixedCosts, FixedCostModal, OpeningBalance)
    Login/
    comps/                 DatedEntryModal, ZasilkovnaModal (zdieľané, otvára ich + Přidat cez AddEntryProvider)
  routes/         __root.tsx, (auth)/login.tsx, (app)/route.tsx, (app)/week/$weekId.tsx, …
  utils/          weekUtils.ts, fixedCostUtils.ts, envelopeUtils.ts, recommendationUtils.ts,
                  alertsUtils.ts, moneyUtils.ts (formát CZK)
supabase/
  migrations/
```

---

## Neskôr

- **Dotykačka:** API je v Sárinej licencii. Registrácia klientskej aplikácie
  ([formulár](https://docs.api.dotypos.com/getting-started/)), potom Supabase Edge Function + pg_cron
  stiahne každú noc `GET /v2/clouds/:cloudId/branches/:branchId/sales-report` do `sales`
  (`source = 'dotykacka'`). Secret a refresh token iba v secrets Edge Function.
- Fotka bločku k výdaju, export CSV.
