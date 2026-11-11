import { CoverageBar, HowCalculated, TrackerStatusPill } from '@/components'
import { Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Ledger } from '@/types'
import { todayDbDate } from '@/utils/dateUtils'
import { getMonthSummary } from '@/utils/envelopeUtils'
import { formatMoney } from '@/utils/moneyUtils'
import { getCarryText, getPeriodText, getStatusMessage } from '@/utils/trackerTextUtils'
import { getMonthTracker } from '@/utils/trackerUtils'
import { TrendingDown, TrendingUp } from 'lucide-react'

type Props = {
  ledger: Ledger | null
  /** `yyyy-MM-01` */
  month: string
}

const Stat = ({
  label,
  value,
  note,
  tone,
}: {
  label: string
  value: string
  note?: React.ReactNode
  /** Green / red for the month result, so it reads at first glance. */
  tone?: 'positive' | 'negative'
}) => (
  <div className='min-w-0'>
    <div className='text-xs font-semibold text-muted-foreground'>{label}</div>
    <div
      className={cn(
        'text-xl font-bold tracking-tight whitespace-nowrap tabular-nums md:text-2xl',
        tone === 'positive' && 'text-positive',
        tone === 'negative' && 'text-negative'
      )}
    >
      {value}
    </div>
    {note ? <div className='mt-0.5 text-xs text-muted-foreground'>{note}</div> : null}
  </div>
)

/**
 * The month at a glance: fixed-cost coverage with the week timeline, and the month's numbers.
 * The always-visible header tracker shows the same coverage in small for the current month.
 */
const MonthOverviewCard = ({ ledger, month }: Props) => {
  if (!ledger) return <Skeleton className='h-64 rounded-3xl' />
  const tracker = getMonthTracker(ledger, todayDbDate(), month)
  const summary = getMonthSummary(ledger, month)

  if (!tracker) {
    return (
      <section className='rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground'>
        Tehdy ještě obchod nebyl otevřený.
      </section>
    )
  }

  const { fixed } = tracker
  const inProgress = tracker.phase !== 'past'
  const carryText = getCarryText(tracker)

  return (
    <section className='relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm shadow-olive/5 md:p-7'>
      {/* Soft light in the corner, like sun on the shop window. */}
      <div
        aria-hidden
        className='pointer-events-none absolute -top-28 -right-24 size-80 rounded-full bg-[radial-gradient(circle,var(--sage-soft),transparent_70%)] opacity-70'
      />
      <div className='relative flex flex-col gap-6'>
        <header className='flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
          <div>
            <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
              <h2 className='font-chalk text-3xl leading-none text-olive'>Fixní náklady</h2>
              <TrackerStatusPill phase={tracker.phase} status={fixed.status} />
            </div>
            <p className='mt-1.5 text-sm text-muted-foreground'>{getPeriodText(tracker)}</p>
          </div>
          {fixed.status === 'noFixedCosts' ? null : (
            <div className='flex items-center gap-x-3 text-sm text-muted-foreground'>
              <span className='rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-olive tabular-nums'>
                {Math.round((fixed.covered / fixed.monthDue) * 100)} %
              </span>
              <span>
                odloženo{' '}
                <span className='text-lg font-bold text-foreground tabular-nums'>
                  {formatMoney(fixed.covered)}
                </span>{' '}
                z {formatMoney(fixed.monthDue)}
              </span>
            </div>
          )}
        </header>

        {fixed.status === 'noFixedCosts' ? (
          <p className='text-sm text-muted-foreground'>{getStatusMessage(tracker)}</p>
        ) : (
          <div className='flex flex-col gap-3'>
            <CoverageBar tracker={tracker} />
            <p className='text-sm'>
              {getStatusMessage(tracker)}
              {carryText ? <span className='text-muted-foreground'> {carryText}</span> : null}
            </p>
          </div>
        )}

        <div className='grid grid-cols-2 gap-x-6 gap-y-5 border-t border-dashed border-border pt-5 md:grid-cols-4'>
          <Stat
            label='Tržby'
            note={
              tracker.paceChange === null ? (
                inProgress ? (
                  'zatím'
                ) : null
              ) : (
                <span className='inline-flex items-center gap-1'>
                  {tracker.paceChange >= 0 ? (
                    <TrendingUp className='size-3.5 text-success-foreground' />
                  ) : (
                    <TrendingDown className='size-3.5' />
                  )}
                  týdně o {Math.abs(tracker.paceChange)} % {tracker.paceChange >= 0 ? 'víc' : 'míň'}{' '}
                  než minulý měsíc
                </span>
              )
            }
            value={formatMoney(summary.sales)}
          />
          <Stat label='Výdaje' value={formatMoney(summary.expenses)} />
          <Stat label='Prodavačce' note='z uzavřených týdnů' value={formatMoney(summary.payouts)} />
          <div className='min-w-0'>
            <Stat
              label={inProgress ? 'Měsíc zatím' : 'Měsíc celkem'}
              note={
                inProgress
                  ? 'fixní náklady jsou započtené celé'
                  : summary.result < 0
                    ? 'tenhle měsíc se tolik nedařilo'
                    : 'co obchodu zůstalo'
              }
              tone={summary.result < 0 ? 'negative' : 'positive'}
              value={formatMoney(summary.result)}
            />
            <HowCalculated
              className='mt-1 text-xs'
              rows={[
                { kind: 'plus', label: 'Tržby', amount: summary.sales },
                { kind: 'minus', label: 'Výdaje', amount: summary.expenses },
                { kind: 'plus', label: 'Zásilkovna', amount: summary.zasilkovna },
                { kind: 'minus', label: 'Vyplaceno prodavačce', amount: summary.payouts },
                ...(summary.ownerTake > 0
                  ? [{ kind: 'minus' as const, label: 'Vzala sis', amount: summary.ownerTake }]
                  : []),
                { kind: 'minus', label: 'Fixní náklady měsíce', amount: summary.fixedCosts },
                {
                  kind: 'total',
                  label: inProgress ? 'Měsíc zatím' : 'Měsíc celkem',
                  amount: summary.result,
                },
                { kind: 'note', label: 'Týden patří k měsíci podle svého čtvrtka.' },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default MonthOverviewCard
