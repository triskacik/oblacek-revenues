import { useDeleteOtherIncome, useRestoreOtherIncome, useSaveZasilkovna } from '@/api/otherIncomes'
import { useSettings } from '@/api/settings'
import { HFField, HFSubmit, HookForm } from '@/components'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import useZodSchemaTypes from '@/hooks/useZodSchemaTypes'
import { toast } from '@/lib/toast'
import type { OtherIncome } from '@/types'
import { dbMonthToInput, inputToDbMonth, parseDbDate, toDbMonth } from '@/utils/dateUtils'
import { toMoneyInput } from '@/utils/moneyUtils'
import { formatMonth } from '@/utils/weekUtils'
import { zodResolver } from '@hookform/resolvers/zod'
import { subMonths } from 'date-fns'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import z from 'zod'
import DeleteButton from '../DeleteButton/DeleteButton'

type Props = {
  open: boolean
  onClose: () => void
  entry?: OtherIncome
  /** Month for a new record, `yyyy-MM-01`. */
  defaultMonth?: string
}

const ZasilkovnaModal = ({ open, onClose, entry, defaultMonth }: Props) => {
  const { data: settings } = useSettings()
  const thisMonth = dbMonthToInput(toDbMonth(new Date()))
  const lastMonth = dbMonthToInput(toDbMonth(subMonths(new Date(), 1)))
  const openingMonth = settings?.opening_date ? settings.opening_date.slice(0, 7) : null
  // The invoice usually comes in the following month, so last month is the natural default.
  const suggestedMonth = openingMonth && lastMonth < openingMonth ? thisMonth : lastMonth

  const { zMonthRequired, zMoneyRequired, zString } = useZodSchemaTypes()
  const schema = z.object({
    month: zMonthRequired()
      .refine(value => value <= thisMonth, 'Měsíc nemůže být v budoucnu')
      .refine(value => !openingMonth || value >= openingMonth, 'Tehdy ještě obchod nebyl otevřený'),
    amount: zMoneyRequired(),
    note: zString(),
  })

  const formMethods = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!open) return
    formMethods.reset({
      month: dbMonthToInput(entry?.month ?? defaultMonth ?? inputToDbMonth(suggestedMonth)),
      amount: toMoneyInput(entry?.amount),
      note: entry?.note ?? '',
    })
  }, [open, entry, defaultMonth, suggestedMonth, formMethods])

  const save = useSaveZasilkovna()
  const remove = useDeleteOtherIncome()
  const restore = useRestoreOtherIncome()

  const onSubmit = async (values: z.output<typeof schema>) => {
    const month = inputToDbMonth(values.month)
    try {
      await save.mutateAsync({ id: entry?.id, month, amount: values.amount, note: values.note })
      toast.success(`Zásilkovna za ${formatMonth(parseDbDate(month))} uložena`)
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
      toast.success('Zásilkovna smazána', {
        duration: 10_000,
        action: {
          label: 'Vrátit',
          onClick: () => {
            restore
              .mutateAsync(entry)
              .then(() => toast.success('Vráceno zpět'))
              .catch(() => toast.error('Vrátit se nepovedlo, zapiš to prosím znovu.'))
          },
        },
      })
    } catch {
      toast.error('Smazat se nepovedlo, zkus to prosím znovu.')
    }
  }

  const setMonth = (value: string) =>
    formMethods.setValue('month', value, { shouldDirty: true, shouldValidate: true })

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className='rounded-2xl sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='font-chalk text-3xl font-normal text-olive'>
            {entry ? 'Upravit Zásilkovnu' : 'Zásilkovna'}
          </DialogTitle>
          <DialogDescription>
            Platba za výdejní místo. Zapiš ji k měsíci, za který je, ne k měsíci, kdy přišla.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...formMethods}>
          <HookForm className='flex flex-col gap-4' onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div className='grid gap-4 sm:grid-cols-2'>
              <HFField autoFocus required field='amount' inputType='money' label='Částka' />
              <div className='flex flex-col gap-2'>
                <HFField
                  required
                  field='month'
                  inputType='month'
                  label='Za měsíc'
                  max={thisMonth}
                  min={openingMonth ?? undefined}
                />
                <div className='flex gap-2'>
                  <Button
                    className='h-7 rounded-full text-xs'
                    type='button'
                    variant='secondary'
                    onClick={() => setMonth(lastMonth)}
                  >
                    Minulý
                  </Button>
                  <Button
                    className='h-7 rounded-full text-xs'
                    type='button'
                    variant='secondary'
                    onClick={() => setMonth(thisMonth)}
                  >
                    Tento
                  </Button>
                </div>
              </div>
            </div>
            <HFField field='note' inputType='text' label='Poznámka' placeholder='Nepovinné' />
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

export default ZasilkovnaModal
