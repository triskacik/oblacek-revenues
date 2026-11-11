import type { Ledger } from '@/types'
import { addDays, addMonths, startOfISOWeek } from 'date-fns'
import { getDueDate } from './alertsUtils'
import { parseDbDate, toDbDate, toDbMonth } from './dateUtils'
import {
  getClosing,
  getMissingSaleDays,
  getMonthSummary,
  getFixedStatus,
  getMonthsBetween,
  getOpeningMonday,
  getOpeningMonth,
  getShopMoney,
  getWeekMonth,
  getWeekTotals,
} from './envelopeUtils'
import { getAmountForMonth, isActiveInMonth } from './fixedCostUtils'
import { sumMoney } from './moneyUtils'
import { getMonthWeekStarts, toWeekId } from './weekUtils'

/*
 * The month tracker: "how am I doing this month?" at a glance (docs/DESIGN.md → Prehľad mesiaca).
 * Coverage of the month's fixed costs counts only what was put aside (closings + Zásilkovna), so it
 * doesn't jump around when a bill is paid early; payments are shown separately.
 */

export type TrackerWeekStatus = 'closed' | 'unclosed' | 'current' | 'upcoming'

export type TrackerStatus = 'noFixedCosts' | 'covered' | 'onTrack' | 'behind'

/** Where `today` is relative to the month. */
export type TrackerPhase = 'past' | 'current' | 'future'

const dueOfMonths = (ledger: Ledger, months: string[]) =>
  sumMoney(
    months.flatMap(month => ledger.fixedCosts.map(cost => getAmountForMonth(cost, month) ?? 0))
  )

/** Average weekly sales of the given weeks, or null when there are none. */
const averageSales = (ledger: Ledger, weeks: string[]) =>
  weeks.length
    ? sumMoney(weeks.map(week => getWeekTotals(ledger, week).sales)) / weeks.length
    : null

/**
 * @param month `yyyy-MM-01`; defaults to the month of today's week (Thursday rule).
 */
export const getMonthTracker = (ledger: Ledger, today: string, monthArg?: string) => {
  const openingMonday = getOpeningMonday(ledger)
  const openingMonth = getOpeningMonth(ledger)
  if (!openingMonday || !openingMonth) return null

  const currentMonday = toDbDate(startOfISOWeek(parseDbDate(today)))
  const month = monthArg ?? getWeekMonth(currentMonday)
  const weeks = getMonthWeekStarts(parseDbDate(month))
    .map(toDbDate)
    .filter(week => week >= openingMonday)
  if (weeks.length === 0) return null

  const firstWeek = weeks[0]
  const lastWeek = weeks[weeks.length - 1]

  // Timeline of the month's weeks.
  const timeline = weeks.map(monday => {
    const status: TrackerWeekStatus = getClosing(ledger, monday)
      ? 'closed'
      : monday < currentMonday
        ? 'unclosed'
        : monday === currentMonday
          ? 'current'
          : 'upcoming'
    return { monday, status }
  })
  const phase: TrackerPhase =
    lastWeek < currentMonday ? 'past' : firstWeek > currentMonday ? 'future' : 'current'
  const weekIndex = weeks.indexOf(currentMonday) + 1
  const weeksLeft = weeks.filter(week => week >= currentMonday).length
  const endedWeeks = weeks.filter(week => week < currentMonday).length

  // Fixed costs of this month and how much of them is already put aside.
  const monthDue = dueOfMonths(ledger, [month])
  const previousMonths = getMonthsBetween(openingMonth, month).slice(0, -1)
  const previousDue = dueOfMonths(ledger, previousMonths)
  const putAsideBefore = sumMoney([
    ledger.settings.opening_fixed,
    ...ledger.closings.filter(c => c.week_start < firstWeek).map(c => c.to_fixed),
    ...ledger.otherIncomes.filter(i => i.month < month).map(i => i.amount),
  ])
  const putAsideNow = sumMoney([
    putAsideBefore,
    ...ledger.closings
      .filter(c => c.week_start >= firstWeek && c.week_start <= lastWeek)
      .map(c => c.to_fixed),
    ...ledger.otherIncomes.filter(i => i.month === month).map(i => i.amount),
  ])
  /** Left over (+) or missing (-) from earlier months, already part of the plan. */
  const carry = sumMoney([putAsideBefore, -previousDue])
  const covered = Math.min(monthDue, Math.max(0, sumMoney([putAsideNow, -previousDue])))
  const remaining = sumMoney([monthDue, -covered])
  /** Where the coverage "should" be after the weeks that already ended. */
  const expected = (monthDue * endedWeeks) / weeks.length
  const thisWeekShare =
    phase !== 'current' || getClosing(ledger, currentMonday)
      ? 0
      : getFixedStatus(ledger, currentMonday).suggestedToFixed

  const status: TrackerStatus =
    monthDue === 0
      ? 'noFixedCosts'
      : covered >= monthDue
        ? 'covered'
        : covered + 1 >= expected
          ? 'onTrack'
          : 'behind'

  // Payments of this month, nearest due date first.
  const bills = ledger.fixedCosts
    .filter(cost => isActiveInMonth(cost, month))
    .map(cost => ({
      id: cost.id,
      name: cost.name,
      amount: getAmountForMonth(cost, month) ?? 0,
      dueDate: getDueDate(cost.due_day, month),
      paid: ledger.payments.some(p => p.fixed_cost_id === cost.id && p.month === month),
    }))
    .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))
  const nextBill = bills.find(bill => !bill.paid) ?? null

  // This month in numbers, and the pace against last month (finished weeks only).
  const sales = sumMoney(weeks.map(week => getWeekTotals(ledger, week).sales))
  const payouts = sumMoney(weeks.map(week => getClosing(ledger, week)?.seller_payout ?? 0))
  const previousMonth = toDbMonth(addMonths(parseDbDate(month), -1))
  const previousWeeks = getMonthWeekStarts(parseDbDate(previousMonth))
    .map(toDbDate)
    .filter(week => week >= openingMonday)
  const thisPace = averageSales(
    ledger,
    weeks.filter(week => week < currentMonday)
  )
  const previousPace = averageSales(ledger, previousWeeks)
  const paceChange =
    thisPace !== null && previousPace !== null && previousPace > 0
      ? Math.round(((thisPace - previousPace) / previousPace) * 100)
      : null

  return {
    month,
    phase,
    previousMonth,
    timeline,
    weekIndex,
    weeksTotal: weeks.length,
    weeksLeft,
    fixed: {
      monthDue,
      covered,
      remaining,
      expected,
      carry,
      thisWeekShare,
      status,
    },
    bills,
    nextBill,
    money: getShopMoney(ledger, today),
    sales,
    payouts,
    paceChange,
  }
}

export type MonthTracker = NonNullable<ReturnType<typeof getMonthTracker>>

export type MonthChecklistItem = {
  id: 'sales' | 'weeks' | 'bills' | 'zasilkovna'
  label: string
  done: boolean
  detail: string | null
  /** Where to fix it. */
  weekId?: string
}

/**
 * "Měsíc hotový": what still needs doing before a month can be called finished. Shown for a past
 * month and in the last week of the current one.
 */
export const getMonthChecklist = (
  ledger: Ledger,
  month: string,
  today: string,
  dismissedIds: string[]
) => {
  const tracker = getMonthTracker(ledger, today, month)
  if (!tracker) return null
  const isEnding = tracker.phase === 'current' && tracker.weeksLeft === 1
  if (tracker.phase !== 'past' && !isEnding) return null

  const weeks = tracker.timeline
  // In the ending month only days before today count; today can still be entered tonight.
  const until = tracker.phase === 'past' ? '9999-12-31' : toDbDate(addDays(parseDbDate(today), -1))
  const missingDays = weeks.flatMap(week => getMissingSaleDays(ledger, week.monday, until))
  const unclosed = weeks.filter(week => week.status !== 'closed')
  const unpaid = tracker.bills.filter(bill => !bill.paid)
  const monthId = month.slice(0, 7)
  const hasZasilkovna = ledger.otherIncomes.some(i => i.month === month && i.kind === 'zasilkovna')
  const zasilkovnaSkipped = !hasZasilkovna && dismissedIds.includes(`zasilkovna-${monthId}`)
  const weekIdOf = (date: string) => toWeekId(parseDbDate(date))

  const items: MonthChecklistItem[] = [
    {
      id: 'sales',
      label: 'Tržby za všechny otevřené dny',
      done: missingDays.length === 0,
      detail: missingDays.length ? `chybí ${missingDays.length}` : null,
      weekId: missingDays[0] ? weekIdOf(missingDays[0]) : undefined,
    },
    {
      id: 'weeks',
      label: 'Všechny týdny uzavřené',
      done: unclosed.length === 0,
      detail: `${weeks.length - unclosed.length} z ${weeks.length}`,
      weekId: unclosed[0] ? weekIdOf(unclosed[0].monday) : undefined,
    },
    {
      id: 'bills',
      label: 'Fixní náklady zaplacené',
      done: unpaid.length === 0,
      detail: tracker.bills.length
        ? `${tracker.bills.length - unpaid.length} z ${tracker.bills.length}`
        : null,
    },
    {
      id: 'zasilkovna',
      label: 'Zásilkovna zapsaná',
      done: hasZasilkovna || zasilkovnaSkipped,
      detail: zasilkovnaSkipped ? 'tento měsíc není' : null,
    },
  ]

  const summary = getMonthSummary(ledger, month)
  return {
    tracker,
    items,
    allDone: items.every(item => item.done),
    payouts: summary.payouts,
    result: summary.result,
  }
}
