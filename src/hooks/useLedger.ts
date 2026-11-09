import { useExpenses } from '@/api/expenses'
import { useFixedCostPayments } from '@/api/fixedCostPayments'
import { useFixedCosts } from '@/api/fixedCosts'
import { useOtherIncomes } from '@/api/otherIncomes'
import { useSales } from '@/api/sales'
import { useSettings } from '@/api/settings'
import { useWeekClosings } from '@/api/weekClosings'
import type { Ledger } from '@/types'

/** Loads all records the money calculations work with; `ledger` is set once everything arrived. */
const useLedger = () => {
  const queries = {
    settings: useSettings(),
    sales: useSales(),
    expenses: useExpenses(),
    otherIncomes: useOtherIncomes(),
    fixedCosts: useFixedCosts(),
    payments: useFixedCostPayments(),
    closings: useWeekClosings(),
  }
  const all = Object.values(queries)

  const ledger: Ledger | null =
    queries.settings.data &&
    queries.sales.data &&
    queries.expenses.data &&
    queries.otherIncomes.data &&
    queries.fixedCosts.data &&
    queries.payments.data &&
    queries.closings.data
      ? {
          settings: queries.settings.data,
          sales: queries.sales.data,
          expenses: queries.expenses.data,
          otherIncomes: queries.otherIncomes.data,
          fixedCosts: queries.fixedCosts.data,
          payments: queries.payments.data,
          closings: queries.closings.data,
        }
      : null

  return {
    ledger,
    isPending: all.some(query => query.isPending),
    isError: all.some(query => query.isError),
  }
}

export default useLedger
