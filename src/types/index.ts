import type { Tables } from './supabase.gen'

export type Expense = Tables<'expenses'>
export type Sale = Tables<'sales'>
export type OtherIncome = Tables<'other_incomes'>
export type FixedCost = Tables<'fixed_costs'>
export type FixedCostAmount = Tables<'fixed_cost_amounts'>
export type FixedCostPayment = Tables<'fixed_cost_payments'>
export type WeekClosing = Tables<'week_closings'>
export type Settings = Tables<'settings'>

export type FixedCostWithAmounts = FixedCost & { fixed_cost_amounts: FixedCostAmount[] }

/** A dated money record entered by hand (expense or sale). */
export type DatedEntryInput = {
  date: string
  amount: number
  note: string | null
}

/** Everything the money calculations need, loaded once (see `useLedger`). */
export type Ledger = {
  settings: Settings
  sales: Sale[]
  expenses: Expense[]
  otherIncomes: OtherIncome[]
  fixedCosts: FixedCostWithAmounts[]
  payments: FixedCostPayment[]
  closings: WeekClosing[]
}
