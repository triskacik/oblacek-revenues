import type { Expense, OtherIncome, Sale } from '@/types'
import { createContext } from 'react'

export type AddEntryContextValue = {
  /** New expense (optionally for a given date), or edit an existing one. */
  openExpense: (options?: { entry?: Expense; date?: string }) => void
  /** New sale (optionally for a given date), or edit an existing one. */
  openSale: (options?: { entry?: Sale; date?: string }) => void
  /** New Zásilkovna income (optionally for a month `yyyy-MM-01`), or edit an existing one. */
  openZasilkovna: (options?: { entry?: OtherIncome; month?: string }) => void
}

const AddEntryContext = createContext<AddEntryContextValue | undefined>(undefined)

export default AddEntryContext
