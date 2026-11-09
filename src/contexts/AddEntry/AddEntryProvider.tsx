import DatedEntryModal from '@/pages/comps/DatedEntryModal/DatedEntryModal'
import ZasilkovnaModal from '@/pages/comps/ZasilkovnaModal/ZasilkovnaModal'
import type { Expense, OtherIncome, Sale } from '@/types'
import { useState } from 'react'
import AddEntryContext from './AddEntryContext'

type ModalState =
  | { kind: 'expense'; entry?: Expense; date?: string }
  | { kind: 'sale'; entry?: Sale; date?: string }
  | { kind: 'zasilkovna'; entry?: OtherIncome; month?: string }
  | null

type Props = {
  children: React.ReactNode
}

/** Owns the add/edit modals so the header menu, bottom nav and day rows can all open them. */
const AddEntryProvider = ({ children }: Props) => {
  const [modal, setModal] = useState<ModalState>(null)
  // Keep the last state while the dialog animates out, so its content doesn't flash empty.
  const [lastModal, setLastModal] = useState<ModalState>(null)
  const shown = modal ?? lastModal

  const open = (next: Exclude<ModalState, null>) => {
    setModal(next)
    setLastModal(next)
  }
  const close = () => setModal(null)

  return (
    <AddEntryContext.Provider
      value={{
        openExpense: options => open({ kind: 'expense', ...options }),
        openSale: options => open({ kind: 'sale', ...options }),
        openZasilkovna: options => open({ kind: 'zasilkovna', ...options }),
      }}
    >
      {children}
      <DatedEntryModal
        defaultDate={shown?.kind === 'expense' ? shown.date : undefined}
        entry={shown?.kind === 'expense' ? shown.entry : undefined}
        kind='expense'
        open={modal?.kind === 'expense'}
        onClose={close}
      />
      <DatedEntryModal
        defaultDate={shown?.kind === 'sale' ? shown.date : undefined}
        entry={shown?.kind === 'sale' ? shown.entry : undefined}
        kind='sale'
        open={modal?.kind === 'sale'}
        onClose={close}
      />
      <ZasilkovnaModal
        defaultMonth={shown?.kind === 'zasilkovna' ? shown.month : undefined}
        entry={shown?.kind === 'zasilkovna' ? shown.entry : undefined}
        open={modal?.kind === 'zasilkovna'}
        onClose={close}
      />
    </AddEntryContext.Provider>
  )
}

export default AddEntryProvider
