import type { FixedCostAmount, FixedCostWithAmounts } from '@/types'

/** Amount history from the oldest change to the newest. */
export const sortAmounts = (amounts: FixedCostAmount[]) =>
  [...amounts].sort((a, b) => a.valid_from.localeCompare(b.valid_from))

/** Amount valid in the month (`yyyy-MM-01`), or `null` before the cost started. 0 = ended. */
export const getAmountForMonth = (cost: FixedCostWithAmounts, month: string) => {
  const valid = sortAmounts(cost.fixed_cost_amounts).filter(a => a.valid_from <= month)
  return valid.length ? valid[valid.length - 1].amount : null
}

export const isActiveInMonth = (cost: FixedCostWithAmounts, month: string) =>
  (getAmountForMonth(cost, month) ?? 0) > 0
