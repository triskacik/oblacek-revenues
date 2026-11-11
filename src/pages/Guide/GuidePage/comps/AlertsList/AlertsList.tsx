import {
  Copy,
  HandCoins,
  House,
  Package,
  ReceiptText,
  Settings,
  ShoppingBasket,
  type LucideIcon,
} from 'lucide-react'

const alerts: { icon: LucideIcon; title: string; text: string; hideable?: boolean }[] = [
  {
    icon: ShoppingBasket,
    title: 'Chybí tržba',
    text: 'Za otevřený den není zapsaná tržba. Dnešní připomenu až po zavírací době, dokud máš otevřeno, nic neřeším.',
  },
  {
    icon: HandCoins,
    title: 'Týden skončil',
    text: 'Po zavření v poslední otevřený den týdne, dokud týden neuzavřeš.',
  },
  {
    icon: House,
    title: 'Nezaplaceno',
    text: 'Fixní náklad je po splatnosti, nebo měsíc skončil a náklad není odškrtnutý.',
  },
  {
    icon: Settings,
    title: 'Chybí den otevření',
    text: 'Když v Nastavení není zadané, kdy obchod otevřel. Bez toho nic nespočítám.',
  },
  {
    icon: Settings,
    title: 'Žádné fixní náklady',
    text: 'Když nejsou zadané žádné fixní náklady, výplata by s nájmem nepočítala.',
    hideable: true,
  },
  {
    icon: ReceiptText,
    title: 'Týden bez výdajů',
    text: 'Celý týden tržby, ale ani jeden výdaj. Nezapomněla jsi něco zapsat?',
    hideable: true,
  },
  {
    icon: Copy,
    title: 'Dvě tržby v jeden den',
    text: 'Často je to překlep. Když je to schválně (třeba hotovost a karta zvlášť), skryj to.',
    hideable: true,
  },
  {
    icon: Package,
    title: 'Zásilkovna',
    text: 'Měsíc skončil a platba za výdejní místo k němu ještě není zapsaná.',
    hideable: true,
  },
  {
    icon: ReceiptText,
    title: 'Výdaje po uzávěrce přesáhly rezervu',
    text: 'Po uzávěrce jsi nakoupila za víc, než sis nechala na nákupy.',
    hideable: true,
  },
]

const AlertsList = () => (
  <ul className='grid gap-3 sm:grid-cols-2'>
    {alerts.map(({ icon: Icon, title, text, hideable }) => (
      <li className='flex gap-3 rounded-2xl border border-border bg-card p-4' key={title}>
        <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-honey-soft text-warning-foreground'>
          <Icon className='size-4' />
        </span>
        <div>
          <h3 className='flex flex-wrap items-center gap-2 text-sm font-bold'>
            {title}
            {hideable ? (
              <span className='rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground'>
                dá se skrýt
              </span>
            ) : null}
          </h3>
          <p className='mt-0.5 text-sm text-muted-foreground'>{text}</p>
        </div>
      </li>
    ))}
  </ul>
)

export default AlertsList
