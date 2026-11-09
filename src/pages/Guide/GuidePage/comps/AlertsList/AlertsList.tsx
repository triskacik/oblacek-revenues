import {
  HandCoins,
  House,
  Package,
  PiggyBank,
  ReceiptText,
  Settings,
  ShoppingBasket,
  type LucideIcon,
} from 'lucide-react'

const alerts: { icon: LucideIcon; title: string; text: string }[] = [
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
    text: 'Tři dny před splatností fixního nákladu, a pokud měsíc skončil a náklad není odškrtnutý.',
  },
  {
    icon: Package,
    title: 'Zásilkovna',
    text: 'Měsíc skončil a platba za výdejní místo k němu ještě není zapsaná.',
  },
  {
    icon: PiggyBank,
    title: 'Na fixní náklady bude chybět',
    text: 'V posledním týdnu měsíce, když se nájem a spol. nestihnou pokrýt. Nevadí, další týdny to dorovnají.',
  },
  {
    icon: ReceiptText,
    title: 'Výdaje po uzávěrce přesáhly rezervu',
    text: 'Když po uzávěrce nakoupíš za víc, než sis nechala na nákupy.',
  },
  {
    icon: Settings,
    title: 'Chybí nastavení',
    text: 'Když není zadané, kdy obchod otevřel, nebo nejsou žádné fixní náklady.',
  },
]

const AlertsList = () => (
  <ul className='grid gap-3 sm:grid-cols-2'>
    {alerts.map(({ icon: Icon, title, text }) => (
      <li className='flex gap-3 rounded-2xl border border-border bg-card p-4' key={title}>
        <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-honey-soft text-warning-foreground'>
          <Icon className='size-4' />
        </span>
        <div>
          <h3 className='text-sm font-bold'>{title}</h3>
          <p className='mt-0.5 text-sm text-muted-foreground'>{text}</p>
        </div>
      </li>
    ))}
  </ul>
)

export default AlertsList
