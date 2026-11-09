const faqs: { question: string; answer: string }[] = [
  {
    question: 'Spletla jsem se v částce. Co teď?',
    answer:
      'Klikni na záznam v přehledu dne, oprav ho a ulož. Nebo ho tam smaž. Všechno se hned přepočítá.',
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
    question: 'Proč je „odloženo na fixní náklady“ v mínusu?',
    answer:
      'Zaplatila jsi nájem dřív, než se na něj stihlo odložit. To je v pořádku, další týdny ho doplní.',
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
