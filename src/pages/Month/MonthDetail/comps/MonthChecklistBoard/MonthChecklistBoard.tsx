import { useDismissedAlertIds } from '@/api/dismissedAlerts'
import { ChalkCheck, Chalkboard, Mascot } from '@/components'
import useAddEntry from '@/hooks/useAddEntry'
import { cn } from '@/lib/utils'
import type { Ledger } from '@/types'
import { todayDbDate } from '@/utils/dateUtils'
import { formatMoney } from '@/utils/moneyUtils'
import { capitalize, monthName } from '@/utils/trackerTextUtils'
import { getMonthChecklist, type MonthChecklistItem } from '@/utils/trackerUtils'
import { Link } from '@tanstack/react-router'

type Props = {
  ledger: Ledger | null
  /** `yyyy-MM-01` */
  month: string
}

const chalkLink =
  'font-chalk chalk-text rounded-full border-2 border-chalk/50 px-3 py-0.5 text-lg leading-snug transition-colors hover:bg-chalk/10'

const ItemAction = ({ item, month }: { item: MonthChecklistItem; month: string }) => {
  const { openZasilkovna } = useAddEntry()
  if (item.done) return null
  if (item.weekId) {
    return (
      <Link className={chalkLink} params={{ weekId: item.weekId }} to='/week/$weekId'>
        {item.id === 'sales' ? 'Doplnit' : 'Uzavřít'}
      </Link>
    )
  }
  if (item.id === 'zasilkovna') {
    return (
      <button className={chalkLink} type='button' onClick={() => openZasilkovna({ month })}>
        Zapsat
      </button>
    )
  }
  return null
}

/**
 * "Měsíc hotový": at the end of a month a chalk checklist of what's left (sales, closings, bills,
 * Zásilkovna). When everything is ticked it turns into a little celebration.
 */
const MonthChecklistBoard = ({ ledger, month }: Props) => {
  const { data: dismissedIds } = useDismissedAlertIds()
  if (!ledger) return null
  const checklist = getMonthChecklist(ledger, month, todayDbDate(), dismissedIds ?? [])
  if (!checklist) return null

  const name = capitalize(monthName(month))
  const doneCount = checklist.items.filter(item => item.done).length

  if (checklist.allDone) {
    return (
      <div className='relative pt-14 md:pt-16'>
        <Mascot className='absolute top-0 left-1/2 w-20 -translate-x-1/2 md:w-24' />
        <Chalkboard className='text-center'>
          <p className='font-chalk chalk-text text-4xl leading-tight md:text-5xl'>
            {name} je hotový!
          </p>
          <p className='mt-2 text-chalk-dim'>
            Týdny uzavřené, tržby zapsané, fixní náklady zaplacené. Hezká práce.
          </p>
          <div className='font-chalk chalk-text mt-4 flex flex-wrap justify-center gap-x-8 gap-y-1 text-xl md:text-2xl'>
            <span>Prodavačce {formatMoney(checklist.payouts)}</span>
            <span>
              {checklist.result >= 0 ? 'Obchodu zůstalo' : 'Měsíc celkem'}{' '}
              {formatMoney(checklist.result)}
            </span>
          </div>
        </Chalkboard>
      </div>
    )
  }

  return (
    <Chalkboard
      title={
        checklist.tracker.phase === 'past' ? `${name}: co ještě chybí` : 'Konec měsíce se blíží'
      }
    >
      <p className='-mt-1 mb-4 text-sm text-chalk-dim'>
        Hotovo {doneCount} ze {checklist.items.length}. Až bude všechno odškrtnuté, je měsíc hotový.
      </p>
      <ul className='grid gap-x-6 gap-y-3 md:grid-cols-2'>
        {checklist.items.map(item => (
          <li className='flex items-center gap-3' key={item.id}>
            <ChalkCheck checked={item.done} />
            <span className='min-w-0 flex-1'>
              <span
                className={cn(
                  'font-chalk chalk-text block text-xl leading-tight',
                  item.done && 'line-through decoration-chalk/60 decoration-2 opacity-70'
                )}
              >
                {item.label}
              </span>
              {item.detail ? (
                <span className='block text-xs text-chalk-dim'>{item.detail}</span>
              ) : null}
            </span>
            <ItemAction item={item} month={month} />
          </li>
        ))}
      </ul>
    </Chalkboard>
  )
}

export default MonthChecklistBoard
