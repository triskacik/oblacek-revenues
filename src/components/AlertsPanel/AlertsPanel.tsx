import { useDismissAlert } from '@/api/dismissedAlerts'
import useAddEntry from '@/hooks/useAddEntry'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import type { Alert, AlertKind } from '@/utils/alertsUtils'
import { Link } from '@tanstack/react-router'
import {
  ClipboardList,
  Copy,
  EyeOff,
  HandCoins,
  House,
  Package,
  ReceiptText,
  Settings,
  ShoppingBasket,
  type LucideIcon,
} from 'lucide-react'
import { Button, Skeleton, Tooltip, TooltipContent, TooltipTrigger } from '../ui'

type Props = {
  /** `null` while loading. Nothing is rendered when there is nothing to do. */
  alerts: Alert[] | null
  className?: string
}

const kindConfig: Record<AlertKind, { icon: LucideIcon; action: string }> = {
  setup: { icon: Settings, action: 'Nastavit' },
  missingSales: { icon: ShoppingBasket, action: 'Doplnit' },
  unclosedWeek: { icon: HandCoins, action: 'Uzavřít' },
  unpaid: { icon: House, action: 'Odškrtnout' },
  zasilkovna: { icon: Package, action: 'Zapsat' },
  noExpenses: { icon: ReceiptText, action: 'Ukázat' },
  duplicateSales: { icon: Copy, action: 'Ukázat' },
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

/** "Co je potřeba udělat": to-dos first, then hints that can be hidden. */
const AlertsPanel = ({ alerts, className }: Props) => {
  const dismiss = useDismissAlert()

  if (!alerts) return <Skeleton className={cn('h-24 rounded-2xl', className)} />
  // Calm when there's nothing: the month tracker above already says "all done".
  if (alerts.length === 0) return null

  const onDismiss = async (alert: Alert) => {
    try {
      await dismiss.mutateAsync(alert.id)
      toast('Upozornění skryto', { description: 'Zobrazit ho znovu můžeš v Nastavení.' })
    } catch {
      toast.error('Nepovedlo se, zkus to prosím znovu.')
    }
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
            <li className='flex items-start gap-3 py-3 last:pb-0 sm:items-center' key={alert.id}>
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full',
                  levelTint[alert.level]
                )}
              >
                <Icon className='size-4' />
              </span>
              {/* On phones the buttons go under the text so the text keeps its width. */}
              <div className='flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-semibold'>{alert.title}</p>
                  {alert.description ? (
                    <p className='text-xs text-muted-foreground'>{alert.description}</p>
                  ) : null}
                </div>
                <div className='flex shrink-0 items-center gap-1'>
                  <AlertAction alert={alert} label={action} />
                  {alert.dismissible ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          aria-label='Skrýt upozornění'
                          className='rounded-full text-muted-foreground'
                          disabled={dismiss.isPending}
                          size='sm'
                          variant='ghost'
                          onClick={() => onDismiss(alert)}
                        >
                          <EyeOff className='size-4' />
                          <span className='sm:sr-only'>Skrýt</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Skrýt upozornění, už ho neukazovat</TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default AlertsPanel
