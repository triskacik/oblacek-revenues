import { Chalkboard, HowCalculated, Mascot, type CalculationRow } from '@/components'
import { cn } from '@/lib/utils'
import type { Ledger } from '@/types'
import { toDbDate } from '@/utils/dateUtils'
import { getMissingSaleDays, getOpeningMonday, getWeekState } from '@/utils/envelopeUtils'
import { formatMoney, parseMoney, sumMoney, toMoneyInput } from '@/utils/moneyUtils'
import { getDefaultKeepInfo, getRecommendation } from '@/utils/recommendationUtils'
import { formatMonth } from '@/utils/weekUtils'
import { Link } from '@tanstack/react-router'
import { addDays, format, parseISO, startOfISOWeek } from 'date-fns'
import { cs } from 'date-fns/locale'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import CloseWeekModal from '../CloseWeekModal/CloseWeekModal'

type Props = {
  ledger: Ledger | null
  /** Monday, `yyyy-MM-dd`. */
  monday: string
  weekNumber: number
}

const chalkButton =
  'font-chalk chalk-text inline-flex items-center rounded-full border-2 border-chalk/60 px-5 py-1.5 text-xl transition-colors hover:bg-chalk/10'

const BoardText = ({ children }: { children: React.ReactNode }) => (
  <p className='mt-2 max-w-md text-sm text-chalk-dim md:text-base'>{children}</p>
)

/**
 * What happened after the closing, in friendly words. The usual case is a weekend stock run paid
 * from the money kept for purchases; only overspending that money gets a (gentle) heads-up.
 */
const getAfterCloseNote = (ledger: Ledger, monday: string) => {
  const week = getWeekState(ledger, monday)
  const closing = week.closing
  if (!closing || week.purchasesNow === null || week.purchasesAtClose === null) return null

  const sunday = toDbDate(addDays(parseISO(monday), 6))
  const boughtAfter = sumMoney(
    ledger.expenses
      .filter(e => e.date >= monday && e.date <= sunday && e.created_at > closing.closed_at)
      .map(e => e.amount)
  )
  const surplusDrop = sumMoney([closing.surplus_at_close, -week.surplus])
  const onlyNewExpenses = boughtAfter > 0 && surplusDrop === boughtAfter

  if (onlyNewExpenses && week.purchasesNow >= 0) {
    return `Po uzávěrce jsi nakoupila za ${formatMoney(boughtAfter)}, z peněz na nákupy zbývá ${formatMoney(week.purchasesNow)}.`
  }
  if (onlyNewExpenses) {
    return `Po uzávěrce jsi nakoupila za ${formatMoney(boughtAfter)}, to je o ${formatMoney(-week.purchasesNow)} víc, než zůstalo na nákupy. Chybějící peníze se odečtou v dalším týdnu.`
  }
  return `Po uzávěrce se změnily záznamy. Výplata zůstává, na nákupy teď zbývá ${formatMoney(week.purchasesNow)} (při uzávěrce ${formatMoney(week.purchasesAtClose)}).`
}

const RecommendationBoard = ({ ledger, monday, weekNumber }: Props) => {
  const [closeOpen, setCloseOpen] = useState(false)
  // Sára can type either field; the other one is computed. null = plain recommendation.
  const [edit, setEdit] = useState<{ field: 'keep' | 'payout'; value: string } | null>(null)
  const [editingPayout, setEditingPayout] = useState(false)

  /** Parsed amount of the edited field, or null when it's empty / not a number / negative. */
  const editedAmount = (field: 'keep' | 'payout') => {
    if (edit?.field !== field) return null
    const parsed = parseMoney(edit.value)
    return parsed === null || Number.isNaN(parsed) || parsed < 0 ? null : parsed
  }

  const getPlan = (currentLedger: Ledger) =>
    getRecommendation(
      currentLedger,
      monday,
      editedAmount('keep') ?? getDefaultKeepInfo(currentLedger, monday).amount,
      editedAmount('payout') ?? undefined
    )

  const currentMonday = toDbDate(startOfISOWeek(new Date()))
  const isCurrentWeek = monday === currentMonday
  const title = isCurrentWeek ? 'Prodavačce tento týden' : `Prodavačce za týden ${weekNumber}`

  const renderContent = () => {
    if (!ledger) {
      return <p className='font-chalk chalk-text text-6xl leading-tight md:text-7xl'>…</p>
    }

    const openingMonday = getOpeningMonday(ledger)
    if (!openingMonday) {
      return (
        <>
          <BoardText>
            Pro výpočet potřebuju vědět, kdy obchod otevřel. Zadej to prosím v nastavení.
          </BoardText>
          <Link className={cn(chalkButton, 'mt-4')} to='/settings'>
            Do nastavení
          </Link>
        </>
      )
    }
    if (monday < openingMonday) {
      return <BoardText>Tehdy ještě obchod nebyl otevřený.</BoardText>
    }
    if (monday > currentMonday) {
      return <BoardText>Tenhle týden teprve přijde.</BoardText>
    }

    const recommendation = getPlan(ledger)
    const { week, fixed } = recommendation
    const payoutEdited = edit?.field === 'payout'
    const keepInfo = getDefaultKeepInfo(ledger, monday)
    const keepSource =
      keepInfo.weeksCounted === 0
        ? 'počáteční stav z nastavení'
        : keepInfo.weeksCounted === 1
          ? 'výdaje za minulý týden'
          : `průměr výdajů za poslední ${keepInfo.weeksCounted} týdny`
    const monthName = formatMonth(parseISO(fixed.month)).split(' ')[0]

    if (week.closing) {
      const closing = week.closing
      return (
        <>
          <p className='text-sm text-chalk-dim'>Vyplaceno</p>
          <p className='font-chalk chalk-text text-6xl leading-tight md:text-7xl'>
            {formatMoney(closing.seller_payout)}
          </p>
          <ul className='mt-3 space-y-1 text-sm text-chalk-dim md:text-base'>
            <li>Odloženo na fixní náklady: {formatMoney(closing.to_fixed)}</li>
            <li>Na nákupy zůstalo: {formatMoney(week.purchasesNow ?? 0)}</li>
            {closing.owner_take > 0 ? <li>Vzala sis: {formatMoney(closing.owner_take)}</li> : null}
          </ul>
          {week.changedAfterClose ? (
            <p className='mt-3 max-w-md rounded-xl bg-chalk/10 px-3 py-2 text-sm text-chalk'>
              {getAfterCloseNote(ledger, monday)}
            </p>
          ) : null}
          <button
            className={cn(chalkButton, 'mt-4')}
            type='button'
            onClick={() => setCloseOpen(true)}
          >
            Upravit uzávěrku
          </button>
        </>
      )
    }

    if (week.sales === 0 && week.expenses === 0) {
      return (
        <>
          <p className='font-chalk chalk-text text-6xl leading-tight md:text-7xl'>- Kč</p>
          <BoardText>
            Zatím tu nejsou žádné tržby ani výdaje. Jakmile je zapíšeš, spočítám, kolik můžeš dát
            prodavačce, aby zbylo na nákupy i na nájem.
          </BoardText>
        </>
      )
    }

    // Closing needs a sale (0 when closed) for every open day, so the week's numbers are final.
    const missingDays = getMissingSaleDays(ledger, monday)

    const rows: CalculationRow[] = [
      { kind: 'plus', label: 'Zbylo na nákupy z minula', amount: week.purchasesBefore },
      { kind: 'plus', label: 'Tržby tento týden', amount: week.sales },
      { kind: 'minus', label: 'Výdaje tento týden', amount: week.expenses },
      { kind: 'total', label: 'K dispozici', amount: week.available },
      {
        kind: 'minus',
        label: 'Odložit na fixní náklady',
        amount: recommendation.toFixed,
        note:
          fixed.missing > 0
            ? `Na ${monthName} chybí ${formatMoney(fixed.missing)}, zbývá týdnů: ${fixed.weeksLeft}`
            : `Na ${monthName} je odloženo dost`,
      },
      {
        kind: 'minus',
        label: 'Nechat na nákupy',
        amount: recommendation.keptForPurchases,
        note: edit ? 'Tvoje částka' : `Návrh: ${keepSource}`,
      },
      { kind: 'total', label: 'Prodavačce', amount: recommendation.payout },
    ]

    return (
      <>
        <div className='flex flex-wrap items-baseline gap-x-3'>
          <p className='text-sm text-chalk-dim'>
            {payoutEdited ? 'Vyplatím' : 'Doporučuji vyplatit'}
          </p>
          {payoutEdited ? (
            <button
              className='text-xs text-chalk-dim underline-offset-4 hover:text-chalk hover:underline'
              type='button'
              onClick={() => {
                setEdit(null)
                setEditingPayout(false)
              }}
            >
              Vrátit doporučení
            </button>
          ) : null}
        </div>
        {editingPayout ? (
          <span className='relative inline-block'>
            <input
              autoFocus
              aria-label='Kolik vyplatím prodavačce'
              className='font-chalk chalk-text w-full max-w-72 rounded-xl border-2 border-chalk/50 bg-transparent py-1 pr-20 pl-3 text-6xl leading-tight outline-none focus:border-chalk/80 md:text-7xl'
              inputMode='decimal'
              value={payoutEdited ? edit.value : toMoneyInput(recommendation.payout)}
              onBlur={() => setEditingPayout(false)}
              onChange={e => setEdit({ field: 'payout', value: e.target.value })}
              onFocus={e => e.currentTarget.select()}
              onKeyDown={e => e.key === 'Enter' && setEditingPayout(false)}
            />
            <span className='font-chalk chalk-text pointer-events-none absolute inset-y-0 right-4 flex items-center text-5xl md:text-6xl'>
              Kč
            </span>
          </span>
        ) : (
          <button
            className='group font-chalk chalk-text flex items-center gap-3 rounded-xl text-left text-6xl leading-tight md:text-7xl'
            title='Klikni a napiš vlastní částku'
            type='button'
            onClick={() => setEditingPayout(true)}
          >
            {formatMoney(recommendation.payout)}
            <Pencil className='size-6 text-chalk-dim opacity-60 transition-opacity group-hover:opacity-100' />
          </button>
        )}

        <div className='mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-chalk-dim md:text-base'>
          <label htmlFor={`keep-${monday}`}>Na nákupy si chci nechat</label>
          <span className='relative'>
            <input
              className='font-chalk chalk-text w-32 rounded-lg border-2 border-chalk/40 bg-transparent py-0.5 pr-9 pl-2 text-right text-xl outline-none focus:border-chalk/80'
              id={`keep-${monday}`}
              inputMode='decimal'
              value={
                edit?.field === 'keep'
                  ? edit.value
                  : payoutEdited
                    ? toMoneyInput(Math.max(0, recommendation.keptForPurchases))
                    : // The suggestion itself, not the few crowns left over from rounding the payout.
                      toMoneyInput(keepInfo.amount)
              }
              onChange={e => setEdit({ field: 'keep', value: e.target.value })}
              onFocus={e => e.currentTarget.select()}
            />
            <span className='font-chalk chalk-text pointer-events-none absolute inset-y-0 right-2 flex items-center text-lg'>
              Kč
            </span>
          </span>
        </div>
        {edit ? null : <p className='mt-1 text-xs text-chalk-dim/80'>Návrh: {keepSource}.</p>}
        <p className='mt-2 text-sm text-chalk-dim'>
          Na fixní náklady odložit {formatMoney(recommendation.toFixed)}.
          {recommendation.keptForPurchases < 0
            ? ` Na nákupy by chybělo ${formatMoney(-recommendation.keptForPurchases)}.`
            : recommendation.keepShortfall
              ? ` Na nákupy teď zbude jen ${formatMoney(recommendation.keptForPurchases)}.`
              : null}
        </p>
        {isCurrentWeek ? (
          <p className='mt-1 text-xs text-chalk-dim/80'>
            Týden ještě běží, číslo se mění s každou tržbou a výdajem.
          </p>
        ) : null}

        <div className='mt-4 flex flex-wrap items-center gap-4'>
          {missingDays.length === 0 ? (
            <button className={chalkButton} type='button' onClick={() => setCloseOpen(true)}>
              Uzavřít týden
            </button>
          ) : null}
          <HowCalculated rows={rows} variant='chalk' />
        </div>
        {missingDays.length > 0 ? (
          <p className='mt-3 text-xs text-chalk-dim/90'>
            Uzavřít půjde, až budou zapsané tržby za všechny otevřené dny (zbývá:{' '}
            {missingDays
              .map(day => format(parseISO(day), 'EEEEEE dd.MM.', { locale: cs }))
              .join(', ')}
            ). Když bylo zavřeno, zapiš tržbu 0.
          </p>
        ) : null}
      </>
    )
  }

  return (
    // On desktop the board lines up with the left column; the cloud pokes up into the empty
    // space next to the page title instead of pushing the board down.
    <div className='relative pt-14 md:pt-16 lg:pt-0'>
      {/* The cloud from the logo walks along the top of the board. */}
      <Mascot className='absolute top-0 right-6 w-20 md:right-10 md:w-24 lg:-top-16' />
      <Chalkboard title={title}>{renderContent()}</Chalkboard>
      {ledger ? (
        <CloseWeekModal
          ledger={ledger}
          monday={monday}
          open={closeOpen}
          suggested={getPlan(ledger)}
          weekNumber={weekNumber}
          onClose={() => setCloseOpen(false)}
        />
      ) : null}
    </div>
  )
}

export default RecommendationBoard
