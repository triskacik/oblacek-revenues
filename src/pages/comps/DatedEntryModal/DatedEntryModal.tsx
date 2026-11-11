import { useDeleteExpense, useExpenses, useRestoreExpense, useSaveExpense } from '@/api/expenses'
import { useDeleteSale, useRestoreSale, useSaveSale } from '@/api/sales'
import { useSettings } from '@/api/settings'
import { HFField, HFSubmit, HookForm } from '@/components'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import useZodSchemaTypes from '@/hooks/useZodSchemaTypes'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import type { Expense, Sale } from '@/types'
import { parseDbDate, todayDbDate } from '@/utils/dateUtils'
import { toMoneyInput } from '@/utils/moneyUtils'
import { getNoteSuggestions } from '@/utils/noteUtils'
import { formatWeekRange, toWeekId } from '@/utils/weekUtils'
import { zodResolver } from '@hookform/resolvers/zod'
import { startOfISOWeek } from 'date-fns'
import { useEffect } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import z from 'zod'
import DeleteButton from '../DeleteButton/DeleteButton'

const texts = {
  expense: {
    newTitle: 'Nový výdaj',
    editTitle: 'Upravit výdaj',
    description: 'Cokoli zaplaceného z peněz obchodu: zboží, drobnosti… Nájem a spol. sem nepatří.',
    notePlaceholder: 'Makro, zelenina',
    amountHint: undefined,
    deleted: 'Výdaj smazán',
  },
  sale: {
    newTitle: 'Tržba',
    editTitle: 'Upravit tržbu',
    description: 'Kolik se ten den prodalo.',
    notePlaceholder: 'Nepovinné',
    amountHint: 'Když bylo výjimečně zavřeno, zadej 0.',
    deleted: 'Tržba smazána',
  },
} as const

type Props = {
  kind: 'expense' | 'sale'
  open: boolean
  onClose: () => void
  /** Existing record → edit mode. */
  entry?: Expense | Sale
  /** Date for a new record, `yyyy-MM-dd`; defaults to today. */
  defaultDate?: string
}

const DatedEntryModal = ({ kind, open, onClose, entry, defaultDate }: Props) => {
  const t = texts[kind]
  const { data: settings } = useSettings()
  const openingDate = settings?.opening_date ?? null

  const { zDateRequired, zMoneyRequired, zString } = useZodSchemaTypes()
  const schema = z.object({
    date: zDateRequired({ min: openingDate, notInFuture: true }),
    amount: zMoneyRequired({ allowZero: kind === 'sale' }),
    note: zString(),
  })

  const formMethods = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!open) return
    formMethods.reset({
      date: entry?.date ?? defaultDate ?? todayDbDate(),
      amount: toMoneyInput(entry?.amount),
      note: entry?.note ?? '',
    })
  }, [open, entry, defaultDate, formMethods])

  const { data: allExpenses } = useExpenses()
  const suggestions =
    kind === 'expense' && allExpenses ? getNoteSuggestions(allExpenses, todayDbDate()) : []
  const currentNote = useWatch({ control: formMethods.control, name: 'note' })

  const saveExpense = useSaveExpense()
  const saveSale = useSaveSale()
  const deleteExpense = useDeleteExpense()
  const deleteSale = useDeleteSale()
  const restoreExpense = useRestoreExpense()
  const restoreSale = useRestoreSale()
  const save = kind === 'expense' ? saveExpense : saveSale
  const remove = kind === 'expense' ? deleteExpense : deleteSale

  const onSubmit = async (values: z.output<typeof schema>) => {
    try {
      await save.mutateAsync({ id: entry?.id, ...values })
      const monday = startOfISOWeek(parseDbDate(values.date))
      const weekNumber = Number(toWeekId(monday).split('-W')[1])
      toast.success(`Uloženo do týdne ${weekNumber}`, {
        description: formatWeekRange(monday, settings?.open_days),
      })
      onClose()
    } catch {
      toast.error('Uložit se nepovedlo, zkus to prosím znovu.')
    }
  }

  const onDelete = async () => {
    if (!entry) return
    try {
      await remove.mutateAsync(entry.id)
      onClose()
      // A slip of the finger on a phone shouldn't cost data: offer to put it back.
      toast.success(t.deleted, {
        duration: 10_000,
        action: {
          label: 'Vrátit',
          onClick: () => {
            const restore =
              kind === 'expense'
                ? restoreExpense.mutateAsync(entry as Expense)
                : restoreSale.mutateAsync(entry as Sale)
            restore
              .then(() => toast.success('Vráceno zpět'))
              .catch(() => toast.error('Vrátit se nepovedlo, zapiš to prosím znovu.'))
          },
        },
      })
    } catch {
      toast.error('Smazat se nepovedlo, zkus to prosím znovu.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className='rounded-2xl sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='font-chalk text-3xl font-normal text-olive'>
            {entry ? t.editTitle : t.newTitle}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <FormProvider {...formMethods}>
          <HookForm className='flex flex-col gap-4' onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div className='grid gap-4 sm:grid-cols-2'>
              <HFField
                autoFocus
                required
                field='amount'
                hint={t.amountHint}
                inputType='money'
                label='Částka'
              />
              <HFField
                required
                field='date'
                inputType='date'
                label='Den'
                max={todayDbDate()}
                min={openingDate ?? undefined}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <HFField
                field='note'
                inputType='text'
                label='Poznámka'
                placeholder={t.notePlaceholder}
              />
              {suggestions.length > 0 ? (
                <div className='flex flex-wrap gap-1.5'>
                  {suggestions.map(note => (
                    <button
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
                        currentNote?.trim() === note
                          ? 'bg-olive text-cream'
                          : 'bg-secondary text-olive-soft hover:text-olive'
                      )}
                      key={note}
                      type='button'
                      onClick={() =>
                        formMethods.setValue('note', note, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    >
                      {note}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              {entry ? (
                <DeleteButton isPending={remove.isPending} onConfirm={onDelete} />
              ) : (
                <span />
              )}
              <HFSubmit isPending={save.isPending} />
            </div>
          </HookForm>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export default DatedEntryModal
