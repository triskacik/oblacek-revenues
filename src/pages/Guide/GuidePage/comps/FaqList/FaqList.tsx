const faqs: { question: string; answer: string }[] = [
  {
    question: 'Spletla jsem se v částce. Co teď?',
    answer:
      'Klikni na záznam v přehledu dne, oprav ho a ulož. Nebo ho tam smaž. Všechno se hned přepočítá. Když smažeš omylem, v oznámení dole máš 10 sekund na tlačítko Vrátit.',
  },
  {
    question: 'Zapomněla jsem něco zapsat.',
    answer:
      'Zapiš to se dnem, kdy se to stalo. Klidně zpětně, i do uzavřeného týdne. Výplata už vyplacená zůstane, rozdíl se projeví v penězích na nákupy.',
  },
  {
    question: 'Obchod byl celý den zavřený.',
    answer: 'Zapiš tržbu 0. Obláček tak pozná, že den není zapomenutý, a týden půjde uzavřít.',
  },
  {
    question: 'Chci změnit nebo zrušit uzávěrku.',
    answer:
      'Otevři týden a na tabuli klikni na Upravit uzávěrku. Tam můžeš čísla opravit, nebo uzávěrku úplně zrušit. Záznamy zůstanou.',
  },
  {
    question: 'Zdražil se nájem.',
    answer:
      'V Nastavení u nákladu klikni na Změnit částku a vyber měsíc, od kterého platí nová. Dřívější měsíce zůstanou, jak byly. Když už náklad neplatíš, zadej 0.',
  },
  {
    question: 'Proč nejde uzavřít týden?',
    answer:
      'Uzavřít jde, až jsou zapsané tržby za všechny otevřené dny. Tabule napíše, které chybí. Když bylo zavřeno, zapiš tržbu 0.',
  },
  {
    question: 'Proč jsou peníze obchodu v mínusu?',
    answer:
      'Nejčastěji proto, že jsi zaplatila nájem dřív, než se na něj stihlo odložit. To je v pořádku, další týdny to doplní. Přesný rozpis najdeš pod „Jak se to počítá“.',
  },
  {
    question: 'Co znamená vykřičník v kroužku?',
    answer:
      'Na fixní náklady máš zatím odloženo méně, než by po skončených týdnech mělo být. Nic se neděje, doporučená výplata to v dalších týdnech dorovná.',
  },
  {
    question: 'Přidala jsem fixní náklad omylem.',
    answer:
      'V Nastavení u nákladu klikni na tužku a dej Smazat náklad. Jde to jen u nákladu, který ještě nemá žádný zaplacený měsíc. Jinak ho ukonči tlačítkem Změnit částku a částkou 0.',
  },
  {
    question: 'Skryla jsem upozornění omylem.',
    answer: 'V Nastavení v kartě Skrytá upozornění klikni na Zobrazit znovu.',
  },
  {
    question: 'Kdy je měsíc hotový?',
    answer:
      'Na konci měsíce se na stránce Měsíc objeví tabule s tím, co ještě chybí: tržby, uzávěrky týdnů, zaplacené fixní náklady a Zásilkovna. Až je všechno odškrtnuté, měsíc je hotový a čeká tě malá oslava.',
  },
  {
    question: 'Jak zapnout upozornění do mobilu?',
    answer:
      'iPhone: otevři Obláček v Safari, klepni na Sdílet a Přidat na plochu. Pak ho otevři z plochy (jen tam upozornění fungují) a v Nastavení u Upozornění klikni na Zapnout a povol je. Android: v Chromu otevři Obláček (můžeš si ho přes menu se třemi tečkami přidat na plochu), v Nastavení u Upozornění klikni na Zapnout a povol je. Na počítači stejně v prohlížeči. Zapíná se na každém zařízení zvlášť.',
  },
  {
    question: 'Nechci dostávat všechna upozornění.',
    answer:
      'V Nastavení u Upozornění si každé vypneš přepínačem, jen pro to zařízení. Čas připomínky tržby si tam taky změníš.',
  },
  {
    question: 'Upozornění mi nechodí.',
    answer:
      'V Nastavení u Upozornění zkus Poslat zkoušku. Když nepřijde, zkontroluj, že telefon nemá zapnutý režim Nerušit a že má Obláček v nastavení telefonu povolená oznámení. Na iPhonu musí být otevřený z plochy, ne ze Safari.',
  },
  {
    question: 'Kdo moje čísla vidí?',
    answer:
      'Jen ty a Tomáš. Přihlásit se dá jen vašimi Google účty a data jsou uložená bezpečně v databázi.',
  },
]

const FaqList = () => (
  <ul className='divide-y divide-dashed divide-border rounded-2xl border border-border bg-card px-5'>
    {faqs.map(({ question, answer }) => (
      <li key={question}>
        <details className='group py-4'>
          <summary className='flex list-none items-center justify-between gap-4 font-semibold'>
            {question}
            <span className='text-xl text-terracotta transition-transform group-open:rotate-45'>
              +
            </span>
          </summary>
          <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>{answer}</p>
        </details>
      </li>
    ))}
  </ul>
)

export default FaqList
