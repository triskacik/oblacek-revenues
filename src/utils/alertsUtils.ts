import type { Ledger } from '@/types'
import { addMonths, addWeeks, format, getDaysInMonth, startOfISOWeek } from 'date-fns'
import { parseDbDate, toDbDate, toDbMonth } from './dateUtils'
import {
  getFixedStatus,
  getMonthEndShortfall,
  getMissingSaleDays,
  getOpenDaysOfWeek,
  getOpeningMonday,
  getOpeningMonth,
  getWeekMonth,
  getWeekState,
} from './envelopeUtils'
import { getAmountForMonth, isActiveInMonth } from './fixedCostUtils'
import { formatMoney } from './moneyUtils'
import { formatMonth, getMonthWeekStarts, toWeekId } from './weekUtils'

/*
 * In-app reminders (docs/DESIGN.md → Upozornenia). Only things Sára should *do*; levels avoid red:
 * info (sage), todo (honey), important (terracotta). Nothing before the opening date matters.
 */

export type AlertLevel = 'info' | 'todo' | 'important'

export type AlertKind =
  'setup' | 'missingSales' | 'unclosedWeek' | 'zasilkovna' | 'unpaid' | 'notCovered' | 'reserve'

export type Alert = {
  id: string
  kind: AlertKind
  level: AlertLevel
  title: string
  description?: string
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
const weekNumberOf = (monday: string) => Number(toWeekId(parseDbDate(monday)).split('-W')[1])

const listDays = (days: string[]) =>
  days.length <= 4
    ? days.map(formatDay).join(', ')
    : `${days.slice(0, 3).map(formatDay).join(', ')} a další ${days.length - 3}`

/**
 * @param now local date-time of the browser; today's sale is expected only after closing time.
 */
export const getAlerts = (ledger: Ledger, now: Date): Alert[] => {
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
        target: { kind: 'settings' },
      },
    ]
  }

  const alerts: Alert[] = []

  // Without fixed costs the recommendation would happily pay out the rent money.
  if (ledger.fixedCosts.length === 0) {
    alerts.push({
      id: 'setup-fixed-costs',
      kind: 'setup',
      level: 'todo',
      title: 'Přidej fixní náklady',
      description: 'Nájem, elektřina… Ať doporučená výplata počítá i s nimi.',
      target: { kind: 'settings' },
    })
  }
  const today = toDbDate(now)
  const timeNow = format(now, 'HH:mm:ss')
  const isAfterClosing = timeNow >= ledger.settings.closing_time
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
      target: { kind: 'week', weekId: toWeekId(parseDbDate(missingDays[0])) },
    })
  }

  // Weeks that ended (after closing time of their last open day) without a closing.
  for (const week of weeks) {
    const openDays = getOpenDaysOfWeek(ledger, week)
    const lastDay = openDays[openDays.length - 1]
    if (!lastDay) continue
    const hasEnded = lastDay < today || (lastDay === today && isAfterClosing)
    if (hasEnded && !getWeekState(ledger, week).closing) {
      const salesMissing = getMissingSaleDays(ledger, week).length > 0
      alerts.push({
        id: `unclosed-${week}`,
        kind: 'unclosedWeek',
        level: 'todo',
        title: `Týden ${weekNumberOf(week)} skončil`,
        description: salesMissing
          ? 'Až doplníš tržby, zapiš, kolik jsi dala prodavačce, a uzavři ho.'
          : 'Zapiš, kolik jsi dala prodavačce, a uzavři ho.',
        target: { kind: 'week', weekId: toWeekId(parseDbDate(week)) },
      })
    }
  }

  // Months: unpaid fixed costs and missing Zásilkovna.
  for (
    let month = openingMonth;
    month <= currentMonth;
    month = toDbMonth(addMonths(parseDbDate(month), 1))
  ) {
    const isPastMonth = month < currentMonth
    const monthId = month.slice(0, 7)

    const unpaid = ledger.fixedCosts
      .filter(cost => isActiveInMonth(cost, month))
      .filter(cost => !ledger.payments.some(p => p.fixed_cost_id === cost.id && p.month === month))
      .map(cost => {
        const dueDay = cost.due_day
          ? `${monthId}-${String(Math.min(cost.due_day, getDaysInMonth(parseDbDate(month)))).padStart(2, '0')}`
          : null
        return { cost, dueDay }
      })
      // This month: remind from 3 days before the due date (or in its last week without one).
      .filter(({ dueDay }) => {
        if (isPastMonth) return true
        if (dueDay) {
          const remindFrom = toDbDate(new Date(parseDbDate(dueDay).getTime() - 3 * 86_400_000))
          return today >= remindFrom
        }
        const lastWeek = getMonthWeekStarts(parseDbDate(month)).at(-1)
        return !!lastWeek && currentMonday >= toDbDate(lastWeek)
      })

    if (unpaid.length > 0) {
      const overdue = unpaid.some(
        ({ dueDay }) => isPastMonth || (dueDay !== null && dueDay < today)
      )
      alerts.push({
        id: `unpaid-${monthId}`,
        kind: 'unpaid',
        level: overdue ? 'important' : 'info',
        title: `Nezaplaceno za ${monthName(month)}: ${unpaid.map(({ cost }) => cost.name).join(', ')}`,
        description: unpaid
          .map(
            ({ cost, dueDay }) =>
              `${cost.name} ${formatMoney(getAmountForMonth(cost, month) ?? 0)}${dueDay ? `, splatné ${formatDay(dueDay)}` : ''}`
          )
          .join(' · '),
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
        target: { kind: 'zasilkovna', month },
      })
    }
  }

  // Last week of the month: will the fixed costs be covered?
  const currentWeekMonth = getWeekMonth(currentMonday)
  const lastWeekOfMonth = getMonthWeekStarts(parseDbDate(currentWeekMonth)).at(-1)
  if (
    lastWeekOfMonth &&
    toDbDate(lastWeekOfMonth) === currentMonday &&
    currentMonday >= openingMonday
  ) {
    const fixed = getFixedStatus(ledger, currentMonday)
    const week = getWeekState(ledger, currentMonday)
    const coveredThisWeek = week.closing
      ? week.closing.to_fixed
      : Math.min(fixed.missing, Math.max(0, week.available))
    const stillMissing = fixed.missing - coveredThisWeek
    if (stillMissing > 0) {
      alerts.push({
        id: 'fixed-not-covered',
        kind: 'notCovered',
        level: 'important',
        title: `Na ${monthName(fixed.month)} bude chybět ${formatMoney(stillMissing)}`,
        description:
          'Tenhle měsíc to na fixní náklady úplně nevyjde. Nevadí, dorovná se to v dalších týdnech.',
        target: { kind: 'week', weekId: toWeekId(parseDbDate(currentMonday)) },
      })
    }
  }

  // The month that just ended (all its weeks closed) still came up short for fixed costs.
  const previousMonth = toDbMonth(addMonths(parseDbDate(currentWeekMonth), -1))
  if (previousMonth >= openingMonth) {
    const { shortfall, allWeeksClosed } = getMonthEndShortfall(ledger, previousMonth)
    if (allWeeksClosed && shortfall > 0) {
      alerts.push({
        id: `shortfall-${previousMonth}`,
        kind: 'notCovered',
        level: 'info',
        title: `Na ${monthName(previousMonth)} nakonec chybělo ${formatMoney(shortfall)}`,
        description: 'Doporučená výplata v dalších týdnech s tím už počítá a dorovná to.',
        target: { kind: 'month', monthId: previousMonth.slice(0, 7) },
      })
    }
  }

  // Closed weeks whose later expenses ate more than the purchases reserve.
  for (const week of weeks) {
    const state = getWeekState(ledger, week)
    if (state.closing && state.purchasesNow !== null && state.purchasesNow < 0) {
      alerts.push({
        id: `reserve-${week}`,
        kind: 'reserve',
        level: 'info',
        title: `Týden ${weekNumberOf(week)}: výdaje po uzávěrce přesáhly rezervu`,
        description: `O ${formatMoney(-state.purchasesNow)} víc, než zůstalo na nákupy.`,
        target: { kind: 'week', weekId: toWeekId(parseDbDate(week)) },
      })
    }
  }

  return alerts.sort((a, b) => levelOrder[a.level] - levelOrder[b.level])
}
