import { pushReminders, type PushKind } from '@/lib/push'
import {
  CalendarClock,
  HandCoins,
  ReceiptText,
  ShoppingBasket,
  type LucideIcon,
} from 'lucide-react'

const icons: Record<PushKind, LucideIcon> = {
  sale: ShoppingBasket,
  close: HandCoins,
  noexp: ReceiptText,
  due: CalendarClock,
}

/** The push reminders, so Sára knows what can buzz her phone and when. */
const PushList = () => (
  <div className='mt-6'>
    <h3 className='font-chalk text-xl leading-none text-olive'>Upozornění do mobilu</h3>
    <p className='mt-1 text-sm text-muted-foreground'>
      Když si je v Nastavení zapneš, připomenu se i bez otevřené aplikace. Každé můžeš pro dané
      zařízení vypnout zvlášť. V upozornění nikdy nejsou částky, protože je vidět i na zamčeném
      displeji.
    </p>
    <ul className='mt-3 grid gap-3 sm:grid-cols-2'>
      {pushReminders.map(({ kind, title, when }) => {
        const Icon = icons[kind]
        return (
          <li className='flex gap-3 rounded-2xl border border-border bg-card p-4' key={kind}>
            <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-sage-soft text-success-foreground'>
              <Icon className='size-4' />
            </span>
            <div>
              <h4 className='text-sm font-bold'>{title}</h4>
              <p className='mt-0.5 text-sm text-muted-foreground'>{when}</p>
            </div>
          </li>
        )
      })}
    </ul>
  </div>
)

export default PushList
