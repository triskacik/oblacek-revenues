import type { Ledger, WeekClosing } from '@/types'
import { addDays, addMonths, addWeeks, getISODay, startOfISOWeek } from 'date-fns'
import { parseDbDate, toDbDate, toDbMonth } from './dateUtils'
import { getAmountForMonth } from './fixedCostUtils'
import { sumMoney } from './moneyUtils'
import { getMonthWeekStarts, getWeekMonthId } from './weekUtils'

/*
 * Money model from docs/DESIGN.md → "Ako to funguje":
 *  - every week: available = purchases carried from last week + sales - expenses,
 *    the closing splits it into payout, to_fixed, owner_take and the rest stays "na nákupy";
 *  - envelope "na fixní" = opening + to_fixed of closings + Zásilkovna - paid fixed costs.
 * All dates are DB strings (`yyyy-MM-dd`, months `yyyy-MM-01`), so comparisons are plain string ones.
 */

/** Monday of the week the shop opened, or `null` until the opening date is set. */
export const getOpeningMonday = (ledger: Ledger) =>
  ledger.settings.opening_date
    ? toDbDate(startOfISOWeek(parseDbDate(ledger.settings.opening_date)))
    : null

export const getOpeningMonth = (ledger: Ledger) =>
  ledger.settings.opening_date ? toDbMonth(parseDbDate(ledger.settings.opening_date)) : null

/** `yyyy-MM-dd` of the Sunday that ends the week starting `monday`. */
const getSunday = (monday: string) => toDbDate(addDays(parseDbDate(monday), 6))

const nextMonday = (monday: string) => toDbDate(addWeeks(parseDbDate(monday), 1))

/** First day of the month the week belongs to (by its Thursday). */
export const getWeekMonth = (monday: string) => `${getWeekMonthId(parseDbDate(monday))}-01`

export const getWeekTotals = (ledger: Ledger, monday: string) => {
  const sunday = getSunday(monday)
  const inWeek = (date: string) => date >= monday && date <= sunday
  const sales = sumMoney(ledger.sales.filter(s => inWeek(s.date)).map(s => s.amount))
  const expenses = sumMoney(ledger.expenses.filter(e => inWeek(e.date)).map(e => e.amount))
  return { sales, expenses, surplus: sumMoney([sales, -expenses]) }
}

export const getClosing = (ledger: Ledger, monday: string): WeekClosing | undefined =>
  ledger.closings.find(c => c.week_start === monday)

/** What a closing takes out of the week's available money. */
const getDistributed = (closing: WeekClosing) =>
  sumMoney([closing.seller_payout, closing.to_fixed, closing.owner_take])

/**
 * "Na nákupy" carried into the week: opening purchases, then each earlier week's rest after its
 * closing. A week that isn't closed yet distributed nothing, so all of its surplus carries on.
 */
export const getPurchasesBefore = (ledger: Ledger, monday: string) => {
  const openingMonday = getOpeningMonday(ledger)
  let carry = ledger.settings.opening_purchases
  if (!openingMonday) return carry
  for (let week = openingMonday; week < monday; week = nextMonday(week)) {
    const closing = getClosing(ledger, week)
    carry = sumMoney([
      carry,
      getWeekTotals(ledger, week).surplus,
      closing ? -getDistributed(closing) : 0,
    ])
  }
  return carry
}

/** Everything about one week: totals, available money and its closing (if any). */
export const getWeekState = (ledger: Ledger, monday: string) => {
  const totals = getWeekTotals(ledger, monday)
  const purchasesBefore = getPurchasesBefore(ledger, monday)
  const available = sumMoney([purchasesBefore, totals.surplus])
  const closing = getClosing(ledger, monday)

  return {
    ...totals,
    purchasesBefore,
    available,
    closing,
    /** Rest for purchases right after closing, from the surplus the closing was made with. */
    purchasesAtClose: closing
      ? sumMoney([purchasesBefore, closing.surplus_at_close, -getDistributed(closing)])
      : null,
    /** Rest for purchases now, including records added after closing. */
    purchasesNow: closing ? sumMoney([available, -getDistributed(closing)]) : null,
    /** Records added/changed after closing (the closing amounts themselves stay). */
    changedAfterClose: closing ? closing.surplus_at_close !== totals.surplus : false,
  }
}

export const getMonthsBetween = (fromMonth: string, toMonth: string) => {
  const months: string[] = []
  for (
    let month = fromMonth;
    month <= toMonth;
    month = toDbMonth(addMonths(parseDbDate(month), 1))
  ) {
    months.push(month)
  }
  return months
}

const getPaidTotal = (ledger: Ledger, fromMonth: string, toMonth: string) =>
  sumMoney(
    ledger.payments
      .filter(p => p.month >= fromMonth && p.month <= toMonth)
      .map(p => {
        const cost = ledger.fixedCosts.find(c => c.id === p.fixed_cost_id)
        return cost ? (getAmountForMonth(cost, p.month) ?? 0) : 0
      })
  )

/**
 * Fixed costs as seen from week `monday` (before its own closing): how much is due up to the
 * week's month, how much is put aside, what is missing and a fair share for this week.
 */
export const getFixedStatus = (ledger: Ledger, monday: string) => {
  const month = getWeekMonth(monday)
  const openingMonth = getOpeningMonth(ledger) ?? month

  const due = sumMoney(
    getMonthsBetween(openingMonth, month).flatMap(m =>
      ledger.fixedCosts.map(cost => getAmountForMonth(cost, m) ?? 0)
    )
  )
  const paid = getPaidTotal(ledger, openingMonth, month)
  const unpaid = sumMoney([due, -paid])

  const saved = sumMoney([
    ledger.settings.opening_fixed,
    ...ledger.closings.filter(c => c.week_start < monday).map(c => c.to_fixed),
    ...ledger.otherIncomes.filter(i => i.month <= month).map(i => i.amount),
    -paid,
  ])
  const missing = Math.max(0, sumMoney([unpaid, -saved]))

  const weeksLeft = Math.max(
    1,
    getMonthWeekStarts(parseDbDate(month)).filter(week => toDbDate(week) >= monday).length
  )

  return {
    month,
    /** Fixed costs of this month alone. */
    monthDue: sumMoney(ledger.fixedCosts.map(cost => getAmountForMonth(cost, month) ?? 0)),
    unpaid,
    saved,
    missing,
    weeksLeft,
    /** Whole crowns, rounded up so the month is covered. */
    suggestedToFixed: Math.ceil(missing / weeksLeft),
  }
}

/** The two envelopes right now, plus the surplus of weeks that aren't closed yet. */
export const getShopMoney = (ledger: Ledger, today: string) => {
  const openingMonday = getOpeningMonday(ledger)
  const fixed = sumMoney([
    ledger.settings.opening_fixed,
    ...ledger.closings.map(c => c.to_fixed),
    ...ledger.otherIncomes.map(i => i.amount),
    -getPaidTotal(ledger, '0000-01-01', '9999-12-01'),
  ])

  if (!openingMonday) {
    return { fixed, purchases: ledger.settings.opening_purchases, openSurplus: 0 }
  }

  const currentMonday = toDbDate(startOfISOWeek(parseDbDate(today)))
  const lastClosed = [...ledger.closings]
    .filter(c => c.week_start >= openingMonday)
    .sort((a, b) => b.week_start.localeCompare(a.week_start))[0]

  const purchases = lastClosed
    ? getPurchasesBefore(ledger, nextMonday(lastClosed.week_start))
    : ledger.settings.opening_purchases

  let openSurplus = 0
  for (
    let week = lastClosed ? nextMonday(lastClosed.week_start) : openingMonday;
    week <= currentMonday;
    week = nextMonday(week)
  ) {
    openSurplus = sumMoney([openSurplus, getWeekTotals(ledger, week).surplus])
  }

  return { fixed, purchases, openSurplus }
}

/** Open days of the week (settings.open_days), from the opening date on, as `yyyy-MM-dd`. */
export const getOpenDaysOfWeek = (ledger: Ledger, monday: string) => {
  const opening = ledger.settings.opening_date
  return Array.from({ length: 7 }, (_, i) => addDays(parseDbDate(monday), i))
    .filter(day => ledger.settings.open_days.includes(getISODay(day)))
    .map(toDbDate)
    .filter(day => !opening || day >= opening)
}

/** Open days of the week (up to `until`, inclusive) without any sale record. 0 counts as filled. */
export const getMissingSaleDays = (ledger: Ledger, monday: string, until = '9999-12-31') =>
  getOpenDaysOfWeek(ledger, monday).filter(
    day => day <= until && !ledger.sales.some(s => s.date === day)
  )

/**
 * A month in numbers (weeks belong to the month of their Thursday):
 * result = surplus + Zásilkovna - payouts - owner take - fixed costs of the month.
 */
export const getMonthSummary = (ledger: Ledger, month: string) => {
  const openingMonday = getOpeningMonday(ledger)
  const weeks = getMonthWeekStarts(parseDbDate(month))
    .map(toDbDate)
    .filter(week => !openingMonday || week >= openingMonday)
    .map(week => ({
      monday: week,
      ...getWeekTotals(ledger, week),
      closing: getClosing(ledger, week),
    }))

  const sales = sumMoney(weeks.map(w => w.sales))
  const expenses = sumMoney(weeks.map(w => w.expenses))
  const payouts = sumMoney(weeks.map(w => w.closing?.seller_payout ?? 0))
  const ownerTake = sumMoney(weeks.map(w => w.closing?.owner_take ?? 0))
  const zasilkovna = sumMoney(ledger.otherIncomes.filter(i => i.month === month).map(i => i.amount))
  const fixedCosts = sumMoney(ledger.fixedCosts.map(cost => getAmountForMonth(cost, month) ?? 0))

  return {
    weeks,
    sales,
    expenses,
    payouts,
    ownerTake,
    zasilkovna,
    fixedCosts,
    result: sumMoney([sales, -expenses, zasilkovna, -payouts, -ownerTake, -fixedCosts]),
  }
}

/**
 * How much was missing for fixed costs when the month ended: fixed costs due up to the month
 * minus everything put aside for them up to its last week (payments cancel out on both sides).
 */
export const getMonthEndShortfall = (ledger: Ledger, month: string) => {
  const openingMonth = getOpeningMonth(ledger) ?? month
  const monthWeeks = getMonthWeekStarts(parseDbDate(month)).map(toDbDate)
  const lastWeek = monthWeeks[monthWeeks.length - 1]

  const due = sumMoney(
    getMonthsBetween(openingMonth, month).flatMap(m =>
      ledger.fixedCosts.map(cost => getAmountForMonth(cost, m) ?? 0)
    )
  )
  const putAside = sumMoney([
    ledger.settings.opening_fixed,
    ...ledger.closings.filter(c => !lastWeek || c.week_start <= lastWeek).map(c => c.to_fixed),
    ...ledger.otherIncomes.filter(i => i.month <= month).map(i => i.amount),
  ])
  return {
    shortfall: Math.max(0, sumMoney([due, -putAside])),
    allWeeksClosed: monthWeeks.every(
      week => week < (getOpeningMonday(ledger) ?? week) || !!getClosing(ledger, week)
    ),
  }
}

/** Month summaries from the opening month up to `today`'s month, at most the last `limit`. */
export const getMonthlyHistory = (ledger: Ledger, today: string, limit = 12) => {
  const openingMonth = getOpeningMonth(ledger)
  if (!openingMonth) return []
  const currentMonth = toDbMonth(parseDbDate(today))
  return getMonthsBetween(openingMonth, currentMonth)
    .slice(-limit)
    .map(month => ({
      month,
      inProgress: month === currentMonth,
      ...getMonthSummary(ledger, month),
    }))
}

/** Shop money (both envelopes) at the end of every week since opening, up to this week. */
export const getShopMoneyHistory = (ledger: Ledger, today: string) => {
  const openingMonday = getOpeningMonday(ledger)
  if (!openingMonday) return []
  const currentMonday = toDbDate(startOfISOWeek(parseDbDate(today)))
  const points: { monday: string; fixed: number; purchases: number; total: number }[] = []

  for (let week = openingMonday; week <= currentMonday; week = nextMonday(week)) {
    const month = getWeekMonth(week)
    const purchases = getPurchasesBefore(ledger, nextMonday(week))
    const fixed = sumMoney([
      ledger.settings.opening_fixed,
      ...ledger.closings.filter(c => c.week_start <= week).map(c => c.to_fixed),
      ...ledger.otherIncomes.filter(i => i.month <= month).map(i => i.amount),
      -getPaidTotal(ledger, '0000-01-01', month),
    ])
    points.push({ monday: week, fixed, purchases, total: sumMoney([fixed, purchases]) })
  }
  return points
}

/** Totals since the shop opened. */
export const getTotalsSinceOpening = (ledger: Ledger, today: string) => {
  const openingMonday = getOpeningMonday(ledger)
  const currentMonday = toDbDate(startOfISOWeek(parseDbDate(today)))
  const finishedWeeks: string[] = []
  if (openingMonday) {
    for (let week = openingMonday; week < currentMonday; week = nextMonday(week)) {
      finishedWeeks.push(week)
    }
  }
  return {
    payouts: sumMoney(ledger.closings.map(c => c.seller_payout)),
    fixedPaid: getPaidTotal(ledger, '0000-01-01', '9999-12-01'),
    zasilkovna: sumMoney(ledger.otherIncomes.map(i => i.amount)),
    averageWeeklySales: finishedWeeks.length
      ? Math.round(
          sumMoney(finishedWeeks.map(week => getWeekTotals(ledger, week).sales)) /
            finishedWeeks.length
        )
      : null,
  }
}
