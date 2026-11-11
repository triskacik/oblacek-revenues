import type { Ledger } from '@/types'
import { addMonths, addWeeks, format, getDaysInMonth, startOfISOWeek } from 'date-fns'
import { parseDbDate, toDbDate, toDbMonth } from './dateUtils'
import {
  getMissingSaleDays,
  getOpenDaysOfWeek,
  getOpeningMonday,
  getOpeningMonth,
  getWeekState,
} from './envelopeUtils'
import { getAmountForMonth, isActiveInMonth } from './fixedCostUtils'
import { formatMoney } from './moneyUtils'
import { formatMonth, toWeekId } from './weekUtils'

/*
 * "Co je potřeba udělat" (docs/DESIGN.md → Upozornenia). Only things to *do* or to double-check.
 * How the month is going (coverage, upcoming due dates, money) lives in the month tracker.
 *
 * - todo / important: needed for correct numbers, cannot be hidden;
 * - info: "is this right?" hints, Sára can hide them (stored in `dismissed_alerts`).
 * Levels avoid red: info (sage), todo (honey), important (terracotta).
 */

export type AlertLevel = 'info' | 'todo' | 'important'

export type AlertKind =
  | 'setup'
  | 'missingSales'
  | 'unclosedWeek'
  | 'unpaid'
  | 'zasilkovna'
  | 'noExpenses'
  | 'duplicateSales'
  | 'reserve'

export type Alert = {
  /** Stable id, also the key under which a hidden alert is stored. */
  id: string
  kind: AlertKind
  level: AlertLevel
  title: string
  description?: string
  /** Info hints can be hidden for good. */
  dismissible: boolean
  /** Where to fix it. */
  target:
    | { kind: 'settings' }
    | { kind: 'week'; weekId: string }
    | { kind: 'month'; monthId: string }
    | { kind: 'zasilkovna'; month: string }
}

const levelOrder: Record<AlertLevel, number> = { important: 0, todo: 1, info: 2 }

const formatDay = (date: string) => format(parseDbDate(date), 'dd.MM.')
const monthName = (month: string) => formatMonth(parseDbDate(month)).split(' ')[0]
const weekIdOf = (date: string) => toWeekId(parseDbDate(date))
const weekNumberOf = (monday: string) => Number(weekIdOf(monday).split('-W')[1])

const listDays = (days: string[]) =>
  days.length <= 4
    ? days.map(formatDay).join(', ')
    : `${days.slice(0, 3).map(formatDay).join(', ')} a další ${days.length - 3}`

/** Due date of a fixed cost in a month (`yyyy-MM-dd`), clamped to the month's last day. */
export const getDueDate = (dueDay: number | null, month: string) =>
  dueDay
    ? `${month.slice(0, 8)}${String(Math.min(dueDay, getDaysInMonth(parseDbDate(month)))).padStart(2, '0')}`
    : null

/**
 * @param now local date-time of the browser; today's sale is expected only after closing time.
 * @param dismissedIds ids of info alerts Sára chose to hide.
 */
export const getAlerts = (ledger: Ledger, now: Date, dismissedIds: string[] = []): Alert[] => {
  const openingMonday = getOpeningMonday(ledger)
  const openingMonth = getOpeningMonth(ledger)
  if (!openingMonday || !openingMonth) {
    return [
      {
        id: 'setup-opening',
        kind: 'setup',
        level: 'important',
        title: 'Zadej, kdy obchod otevřel',
        description: 'Bez toho nejde spočítat výplatu ani peníze obchodu.',
        dismissible: false,
        target: { kind: 'settings' },
      },
    ]
  }

  const alerts: Alert[] = []
  const today = toDbDate(now)
  const isAfterClosing = format(now, 'HH:mm:ss') >= ledger.settings.closing_time
  const currentMonday = toDbDate(startOfISOWeek(now))
  const currentMonth = toDbMonth(now)

  const weeks: string[] = []
  for (
    let week = openingMonday;
    week <= currentMonday;
    week = toDbDate(addWeeks(parseDbDate(week), 1))
  ) {
    weeks.push(week)
  }

  if (ledger.fixedCosts.length === 0) {
    alerts.push({
      id: 'setup-fixed-costs',
      kind: 'setup',
      level: 'info',
      title: 'Přidej fixní náklady',
      description: 'Nájem, elektřina… Ať doporučená výplata počítá i s nimi.',
      dismissible: true,
      target: { kind: 'settings' },
    })
  }

  // Missing sales (all weeks together), today only after closing time.
  const lastExpectedDay = isAfterClosing
    ? today
    : toDbDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))
  const missingDays = weeks.flatMap(week => getMissingSaleDays(ledger, week, lastExpectedDay))
  if (missingDays.length > 0) {
    alerts.push({
      id: 'missing-sales',
      kind: 'missingSales',
      level: 'todo',
      title:
        missingDays.length === 1
          ? `Chybí tržba za ${formatDay(missingDays[0])}`
          : `Chybí tržby za ${listDays(missingDays)}`,
      description: 'Když bylo zavřeno, zapiš tržbu 0.',
      dismissible: false,
      target: { kind: 'week', weekId: weekIdOf(missingDays[0]) },
    })
  }

  for (const week of weeks) {
    const openDays = getOpenDaysOfWeek(ledger, week)
    const lastDay = openDays[openDays.length - 1]
    if (!lastDay) continue
    const hasEnded = lastDay < today || (lastDay === today && isAfterClosing)
    if (!hasEnded) continue
    const state = getWeekState(ledger, week)

    // Ended weeks without a closing.
    if (!state.closing) {
      const salesMissing = getMissingSaleDays(ledger, week).length > 0
      alerts.push({
        id: `unclosed-${week}`,
        kind: 'unclosedWeek',
        level: 'todo',
        title: `Týden ${weekNumberOf(week)} skončil`,
        description: salesMissing
          ? 'Až doplníš tržby, zapiš, kolik jsi dala prodavačce, a uzavři ho.'
          : 'Zapiš, kolik jsi dala prodavačce, a uzavři ho.',
        dismissible: false,
        target: { kind: 'week', weekId: weekIdOf(week) },
      })
    }

    // A whole week of sales without a single expense is unusual for a grocery.
    if (state.sales > 0 && state.expenses === 0) {
      alerts.push({
        id: `no-expenses-${week}`,
        kind: 'noExpenses',
        level: 'info',
        title: `Týden ${weekNumberOf(week)} nemá žádný výdaj`,
        description: 'Nezapomněla jsi něco zapsat? Jestli je to správně, upozornění skryj.',
        dismissible: true,
        target: { kind: 'week', weekId: weekIdOf(week) },
      })
    }

    // Later expenses ate more than the money kept for purchases.
    if (state.closing && state.purchasesNow !== null && state.purchasesNow < 0) {
      alerts.push({
        id: `reserve-${week}`,
        kind: 'reserve',
        level: 'info',
        title: `Týden ${weekNumberOf(week)}: po uzávěrce víc výdajů než rezerva`,
        description: `O ${formatMoney(-state.purchasesNow)} víc, než zůstalo na nákupy. Chybějící peníze se odečtou v dalším týdnu.`,
        dismissible: true,
        target: { kind: 'week', weekId: weekIdOf(week) },
      })
    }
  }

  // Two sales on one day are often a typo (or cash and card entered separately).
  const salesByDay = new Map<string, number>()
  for (const sale of ledger.sales) {
    if (sale.date >= openingMonday) salesByDay.set(sale.date, (salesByDay.get(sale.date) ?? 0) + 1)
  }
  for (const [date, count] of salesByDay) {
    if (count < 2) continue
    alerts.push({
      id: `duplicate-sales-${date}`,
      kind: 'duplicateSales',
      level: 'info',
      title: `Na ${formatDay(date)} jsou zapsané ${count} tržby`,
      description: 'Není některá navíc? Jestli je to schválně, upozornění skryj.',
      dismissible: true,
      target: { kind: 'week', weekId: weekIdOf(date) },
    })
  }

  // Months: overdue fixed costs (upcoming ones are shown in the month tracker) and Zásilkovna.
  for (
    let month = openingMonth;
    month <= currentMonth;
    month = toDbMonth(addMonths(parseDbDate(month), 1))
  ) {
    const isPastMonth = month < currentMonth
    const monthId = month.slice(0, 7)

    const overdue = ledger.fixedCosts
      .filter(cost => isActiveInMonth(cost, month))
      .filter(cost => !ledger.payments.some(p => p.fixed_cost_id === cost.id && p.month === month))
      .map(cost => ({ cost, dueDate: getDueDate(cost.due_day, month) }))
      .filter(({ dueDate }) => isPastMonth || (dueDate !== null && dueDate < today))

    if (overdue.length > 0) {
      alerts.push({
        id: `unpaid-${monthId}`,
        kind: 'unpaid',
        level: 'important',
        title: `Nezaplaceno za ${monthName(month)}: ${overdue.map(({ cost }) => cost.name).join(', ')}`,
        description:
          overdue
            .map(
              ({ cost, dueDate }) =>
                `${cost.name} ${formatMoney(getAmountForMonth(cost, month) ?? 0)}${dueDate ? `, splatné ${formatDay(dueDate)}` : ''}`
            )
            .join(' · ') + '. Když už je zaplaceno, jen ho odškrtni.',
        dismissible: false,
        target: { kind: 'month', monthId },
      })
    }

    const hasZasilkovna = ledger.otherIncomes.some(
      i => i.month === month && i.kind === 'zasilkovna'
    )
    if (isPastMonth && !hasZasilkovna) {
      alerts.push({
        id: `zasilkovna-${monthId}`,
        kind: 'zasilkovna',
        level: 'info',
        title: `Za ${monthName(month)} ještě není zapsaná Zásilkovna`,
        description: 'Až přijde platba za výdejní místo, zapiš ji k tomuhle měsíci.',
        dismissible: true,
        target: { kind: 'zasilkovna', month },
      })
    }
  }

  return alerts
    .filter(alert => !(alert.dismissible && dismissedIds.includes(alert.id)))
    .sort((a, b) => levelOrder[a.level] - levelOrder[b.level])
}
