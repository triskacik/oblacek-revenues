import type { Ledger } from '@/types'
import { addWeeks } from 'date-fns'
import { parseDbDate, toDbDate } from './dateUtils'
import { getFixedStatus, getOpeningMonday, getWeekState, getWeekTotals } from './envelopeUtils'
import { sumMoney } from './moneyUtils'

const KEEP_AVERAGE_WEEKS = 4

/**
 * Default "keep for purchases": the average weekly expenses of the last 4 weeks before this one
 * (fewer right after opening), rounded up to whole hundreds. Before any week exists it falls back
 * to the opening purchases money from Settings.
 */
export const getDefaultKeepInfo = (ledger: Ledger, monday: string) => {
  const openingMonday = getOpeningMonday(ledger)
  const weeks: string[] = []
  for (
    let week = toDbDate(addWeeks(parseDbDate(monday), -1));
    openingMonday && week >= openingMonday && weeks.length < KEEP_AVERAGE_WEEKS;
    week = toDbDate(addWeeks(parseDbDate(week), -1))
  ) {
    weeks.push(week)
  }

  if (weeks.length === 0) {
    return { amount: Math.max(0, ledger.settings.opening_purchases), weeksCounted: 0 }
  }
  const average = sumMoney(weeks.map(week => getWeekTotals(ledger, week).expenses)) / weeks.length
  return { amount: Math.ceil(average / 100) * 100, weeksCounted: weeks.length }
}

/**
 * Payout recommendation for an open week (docs/DESIGN.md → Odporúčanie):
 *   toFixed = fair share of what's missing for fixed costs, at most what's available
 *   payout  = available - toFixed - keep (never below 0, whole crowns)
 * With `payoutOverride` (Sára typed the payout herself) it works backwards: the purchases
 * money is what's left after toFixed and her payout.
 */
export const getRecommendation = (
  ledger: Ledger,
  monday: string,
  keep: number,
  payoutOverride?: number
) => {
  const week = getWeekState(ledger, monday)
  const fixed = getFixedStatus(ledger, monday)

  const toFixed = Math.min(fixed.suggestedToFixed, Math.max(0, week.available))
  const afterFixed = sumMoney([week.available, -toFixed])
  const payout =
    payoutOverride !== undefined
      ? Math.max(0, payoutOverride)
      : Math.max(0, Math.floor(sumMoney([afterFixed, -keep])))
  const keptForPurchases = sumMoney([afterFixed, -payout])

  return {
    week,
    fixed,
    toFixed,
    keep,
    payout,
    /** What really stays for purchases (less than `keep` when there isn't enough). */
    keptForPurchases,
    /** True when there isn't enough left to keep the whole amount Sára wanted. */
    keepShortfall: payoutOverride === undefined && keptForPurchases < keep,
  }
}
