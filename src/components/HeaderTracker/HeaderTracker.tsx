import useShopStatus from '@/hooks/useShopStatus'
import { cn } from '@/lib/utils'
import type { Alert } from '@/utils/alertsUtils'
import { formatMoney, sumMoney } from '@/utils/moneyUtils'
import {
  capitalize,
  getCarryText,
  getPeriodText,
  getStatusMessage,
  monthName,
  todoText,
} from '@/utils/trackerTextUtils'
import type { MonthTracker } from '@/utils/trackerUtils'
import { getCurrentWeekId } from '@/utils/weekUtils'
import { Link } from '@tanstack/react-router'
import { Check, ChevronRight, ClipboardList } from 'lucide-react'
import { useState } from 'react'
import BillsChips from '../BillsChips/BillsChips'
import CoverageBar from '../CoverageBar/CoverageBar'
import HowCalculated from '../HowCalculated/HowCalculated'
import TrackerStatusPill from '../TrackerStatusPill/TrackerStatusPill'
import { Popover, PopoverContent, PopoverTrigger } from '../ui'
import ProgressRing from './ProgressRing'

type ViewProps = {
  tracker: MonthTracker
  alerts: Alert[]
}

const statusLabel = {
  covered: 'Pokryto',
  onTrack: 'Odkládáš včas',
  behind: 'Trochu pozadu',
  noFixedCosts: 'Bez fixních nákladů',
} as const

/** The trigger + popover, from plain props (also usable for previews). */
export const HeaderTrackerView = ({ tracker, alerts }: ViewProps) => {
  const [open, setOpen] = useState(false)
  const { fixed, money } = tracker
  const ratio = fixed.monthDue > 0 ? fixed.covered / fixed.monthDue : 0
  const tone =
    fixed.status === 'behind' ? 'honey' : fixed.status === 'noFixedCosts' ? 'muted' : 'sage'
  const carryText = getCarryText(tracker)
  const moneyTotal = sumMoney([money.fixed, money.purchases])
  const close = () => setOpen(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={`${capitalize(monthName(tracker.month))}: ${statusLabel[fixed.status]}, ${todoText(alerts.length)}`}
          className='relative flex items-center gap-2.5 rounded-full p-1 transition-colors hover:bg-secondary/70 lg:bg-secondary/50 lg:py-1 lg:pr-4 lg:pl-1 lg:ring-1 lg:ring-white/50'
          type='button'
        >
          <ProgressRing tone={tone} value={ratio} />
          <span className='hidden text-left leading-tight lg:block'>
            <span className='block text-sm font-bold'>{capitalize(monthName(tracker.month))}</span>
            <span
              className={cn(
                'block text-xs font-semibold',
                fixed.status === 'behind' ? 'text-warning-foreground' : 'text-success-foreground'
              )}
            >
              {statusLabel[fixed.status]}
            </span>
          </span>
          {alerts.length > 0 ? (
            <span className='absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-terracotta text-[11px] font-bold text-cream ring-2 ring-cream lg:static lg:ml-0.5 lg:ring-0'>
              {alerts.length}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align='end'
        className='w-[min(24rem,calc(100vw-1.5rem))] rounded-3xl border-border p-0 shadow-xl shadow-olive/15'
        collisionPadding={12}
        sideOffset={10}
      >
        <div className='flex flex-col gap-5 p-5'>
          <header>
            <div className='flex flex-wrap items-center gap-2.5'>
              <h2 className='font-chalk text-3xl leading-none text-olive'>
                {capitalize(monthName(tracker.month))}
              </h2>
              <TrackerStatusPill phase={tracker.phase} status={fixed.status} />
            </div>
            <p className='mt-1 text-xs text-muted-foreground'>{getPeriodText(tracker)}</p>
          </header>

          {fixed.status === 'noFixedCosts' ? (
            <p className='text-sm text-muted-foreground'>{getStatusMessage(tracker)}</p>
          ) : (
            <div className='flex flex-col gap-2.5'>
              <div className='flex items-baseline justify-between gap-3 text-sm'>
                <span className='font-semibold'>Fixní náklady</span>
                <span className='text-muted-foreground'>
                  <span className='font-bold text-foreground tabular-nums'>
                    {formatMoney(fixed.covered)}
                  </span>{' '}
                  z {formatMoney(fixed.monthDue)}
                </span>
              </div>
              <CoverageBar tracker={tracker} />
              <p className='text-sm'>
                {getStatusMessage(tracker)}
                {carryText ? <span className='text-muted-foreground'> {carryText}</span> : null}
              </p>
              <BillsChips bills={tracker.bills} />
            </div>
          )}

          <div className='grid grid-cols-2 gap-4 rounded-2xl bg-secondary/50 p-4'>
            <div>
              <div className='text-xs font-semibold text-muted-foreground'>Peníze obchodu</div>
              <div
                className={cn(
                  'text-lg font-bold tabular-nums',
                  moneyTotal < 0 && 'text-accent-foreground'
                )}
              >
                {formatMoney(moneyTotal)}
              </div>
              {money.openSurplus !== 0 ? (
                <div className='text-[11px] text-muted-foreground'>
                  + {formatMoney(money.openSurplus)} z neuzavřených týdnů
                </div>
              ) : null}
            </div>
            <div>
              <div className='text-xs font-semibold text-muted-foreground'>Na nákupy</div>
              <div
                className={cn(
                  'text-lg font-bold tabular-nums',
                  money.purchases < 0 && 'text-accent-foreground'
                )}
              >
                {formatMoney(money.purchases)}
              </div>
              <div className='text-[11px] text-muted-foreground'>po poslední uzávěrce</div>
            </div>
            <HowCalculated
              className='col-span-2 text-xs'
              rows={[
                { kind: 'plus', label: 'Odloženo na fixní náklady', amount: money.fixed },
                { kind: 'plus', label: 'Na nákupy', amount: money.purchases },
                { kind: 'total', label: 'Peníze obchodu', amount: moneyTotal },
                {
                  kind: 'note',
                  label:
                    'Stav po poslední uzávěrce: výplaty, odložené peníze a zaplacené fixní náklady jsou už odečtené. Odloženo na fixní náklady může být v mínusu, když se zaplatilo dřív, než se našetřilo.',
                },
              ]}
            />
          </div>

          <div>
            <div className='mb-2 flex items-center gap-2 text-sm font-semibold'>
              <ClipboardList className='size-4 text-olive-soft' />
              {alerts.length === 0 ? (
                <span className='inline-flex items-center gap-1 text-success-foreground'>
                  <Check className='size-4' /> Nic nečeká, všechno je hotové
                </span>
              ) : (
                todoText(alerts.length)
              )}
            </div>
            {alerts.length > 0 ? (
              <ul className='flex flex-col gap-1.5'>
                {alerts.slice(0, 3).map(alert => (
                  <li className='flex items-start gap-2 text-sm' key={alert.id}>
                    <span
                      className={cn(
                        'mt-1.5 size-2 shrink-0 rounded-full',
                        alert.level === 'important'
                          ? 'bg-terracotta'
                          : alert.level === 'todo'
                            ? 'bg-honey'
                            : 'bg-sage'
                      )}
                    />
                    {alert.title}
                  </li>
                ))}
                {alerts.length > 3 ? (
                  <li className='pl-4 text-xs text-muted-foreground'>
                    a {alerts.length - 3} další
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>
        </div>

        <footer className='flex items-center justify-between gap-3 border-t border-border px-5 py-3'>
          <Link
            className='inline-flex items-center gap-0.5 text-sm font-semibold text-olive-soft hover:text-olive'
            params={{ weekId: getCurrentWeekId() }}
            to='/week/$weekId'
            onClick={close}
          >
            {alerts.length > 0 ? 'Vyřídit úkoly' : 'Tento týden'}
            <ChevronRight className='size-4' />
          </Link>
          <Link
            className='inline-flex items-center gap-0.5 text-sm font-semibold text-olive-soft hover:text-olive'
            params={{ monthId: tracker.month.slice(0, 7) }}
            to='/month/$monthId'
            onClick={close}
          >
            Detail měsíce <ChevronRight className='size-4' />
          </Link>
        </footer>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Always-visible sanity check in the app header: a ring with this month's fixed-cost coverage,
 * the status and the number of open to-dos; the popover shows the details.
 */
const HeaderTracker = () => {
  const { tracker, alerts } = useShopStatus()
  if (!tracker || !alerts) return null
  return <HeaderTrackerView alerts={alerts} tracker={tracker} />
}

export default HeaderTracker
