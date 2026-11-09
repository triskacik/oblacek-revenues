import useAddEntry from '@/hooks/useAddEntry'
import { cn } from '@/lib/utils'
import type { Ledger } from '@/types'
import { getAlerts, type Alert, type AlertKind } from '@/utils/alertsUtils'
import { Link } from '@tanstack/react-router'
import {
  ClipboardList,
  HandCoins,
  House,
  Leaf,
  Package,
  PiggyBank,
  ReceiptText,
  Settings,
  ShoppingBasket,
  type LucideIcon,
} from 'lucide-react'
import { Button, Skeleton } from '../ui'

type Props = {
  ledger: Ledger | null
  className?: string
}

const kindConfig: Record<AlertKind, { icon: LucideIcon; action: string }> = {
  setup: { icon: Settings, action: 'Nastavit' },
  missingSales: { icon: ShoppingBasket, action: 'Doplnit' },
  unclosedWeek: { icon: HandCoins, action: 'Uzavřít' },
  zasilkovna: { icon: Package, action: 'Zapsat' },
  unpaid: { icon: House, action: 'Odškrtnout' },
  notCovered: { icon: PiggyBank, action: 'Ukázat' },
  reserve: { icon: ReceiptText, action: 'Ukázat' },
}

// Same tinted circles as the stat tiles; the level only changes the tint, never to red.
const levelTint = {
  important: 'bg-terracotta-soft text-terracotta',
  todo: 'bg-honey-soft text-warning-foreground',
  info: 'bg-sage-soft text-success-foreground',
} as const

const AlertAction = ({ alert, label }: { alert: Alert; label: string }) => {
  const { openZasilkovna } = useAddEntry()
  const buttonProps = {
    className: 'shrink-0 rounded-full',
    size: 'sm',
    variant: 'secondary',
  } as const

  if (alert.target.kind === 'zasilkovna') {
    const { month } = alert.target
    return (
      <Button {...buttonProps} onClick={() => openZasilkovna({ month })}>
        {label}
      </Button>
    )
  }
  if (alert.target.kind === 'settings') {
    return (
      <Button asChild {...buttonProps}>
        <Link to='/settings'>{label}</Link>
      </Button>
    )
  }
  return (
    <Button asChild {...buttonProps}>
      {alert.target.kind === 'month' ? (
        <Link params={{ monthId: alert.target.monthId }} to='/month/$monthId'>
          {label}
        </Link>
      ) : (
        <Link params={{ weekId: alert.target.weekId }} to='/week/$weekId'>
          {label}
        </Link>
      )}
    </Button>
  )
}

/** What needs doing, most important first. Calm when there's nothing. */
const AlertsPanel = ({ ledger, className }: Props) => {
  if (!ledger) return <Skeleton className={cn('h-24 rounded-2xl', className)} />

  const alerts = getAlerts(ledger, new Date())

  if (alerts.length === 0) {
    return (
      <section
        className={cn(
          'flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm shadow-olive/5',
          className
        )}
      >
        <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-sage-soft text-success-foreground'>
          <Leaf className='size-5' />
        </span>
        <div>
          <h2 className='font-chalk text-2xl leading-none text-olive'>Všechno v klidu</h2>
          <p className='mt-1 text-sm text-muted-foreground'>Teď není potřeba nic dělat.</p>
        </div>
      </section>
    )
  }

  return (
    <section
      className={cn(
        'rounded-2xl border border-border bg-card p-5 shadow-sm shadow-olive/5',
        className
      )}
    >
      <header className='mb-2 flex items-center gap-3'>
        <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-olive-soft'>
          <ClipboardList className='size-5' />
        </span>
        <h2 className='font-chalk text-2xl leading-none text-olive'>Co je potřeba udělat</h2>
        <span className='ml-auto flex size-7 items-center justify-center rounded-full bg-terracotta text-sm font-bold text-cream'>
          {alerts.length}
        </span>
      </header>
      <ul className='divide-y divide-dashed divide-border'>
        {alerts.map(alert => {
          const { icon: Icon, action } = kindConfig[alert.kind]
          return (
            <li className='flex items-center gap-3 py-3 last:pb-0' key={alert.id}>
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full',
                  levelTint[alert.level]
                )}
              >
                <Icon className='size-4' />
              </span>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold'>{alert.title}</p>
                {alert.description ? (
                  <p className='text-xs text-muted-foreground'>{alert.description}</p>
                ) : null}
              </div>
              <AlertAction alert={alert} label={action} />
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default AlertsPanel
