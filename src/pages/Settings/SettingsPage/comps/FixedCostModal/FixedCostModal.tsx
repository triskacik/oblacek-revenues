import { useFixedCostPayments } from '@/api/fixedCostPayments'
import { useCreateFixedCost, useDeleteFixedCost, useUpdateFixedCost } from '@/api/fixedCosts'
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
import DeleteButton from '@/pages/comps/DeleteButton/DeleteButton'
import type { FixedCostWithAmounts } from '@/types'
import { dbMonthToInput, inputToDbMonth, toDbMonth } from '@/utils/dateUtils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import z from 'zod'

type Props = {
  open: boolean
  onClose: () => void
  /** Edit mode: only name and due day; amounts change via FixedCostAmountModal. */
  cost?: FixedCostWithAmounts
}

const FixedCostModal = ({ open, onClose, cost }: Props) => {
  const isEdit = !!cost
  const { zStringRequired, zMoneyRequired, zMonthRequired } = useZodSchemaTypes()

  const zDueDay = z
    .string()
    .trim()
    .transform(value => (value === '' ? null : Number(value)))
    .refine(
      value => value === null || (Number.isInteger(value) && value >= 1 && value <= 31),
      'Zadej den 1 - 31 nebo nech pole prázdné'
    )

  const schema = z.object({
    name: zStringRequired(),
    dueDay: zDueDay,
    // Ignored in edit mode; kept valid there so the form can submit.
    amount: isEdit ? z.string().transform(() => 0) : zMoneyRequired(),
    validFrom: isEdit ? z.string() : zMonthRequired(),
  })

  const formMethods = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!open) return
    formMethods.reset({
      name: cost?.name ?? '',
      dueDay: cost?.due_day ? String(cost.due_day) : '',
      amount: '',
      validFrom: dbMonthToInput(toDbMonth(new Date())),
    })
  }, [open, cost, formMethods])

  const createCost = useCreateFixedCost()
  const updateCost = useUpdateFixedCost()
  const deleteCost = useDeleteFixedCost()
  const { data: payments } = useFixedCostPayments()
  // Paid costs are part of the money history: they can be ended (amount 0), not deleted.
  const hasPayments = !!cost && !!payments?.some(p => p.fixed_cost_id === cost.id)

  const onDelete = async () => {
    if (!cost) return
    try {
      await deleteCost.mutateAsync(cost.id)
      toast.success('Fixní náklad smazán')
      onClose()
    } catch {
      toast.error('Smazat se nepovedlo, zkus to prosím znovu.')
    }
  }

  const onSubmit = async (values: z.output<typeof schema>) => {
    try {
      if (cost) {
        await updateCost.mutateAsync({ id: cost.id, name: values.name, dueDay: values.dueDay })
      } else {
        await createCost.mutateAsync({
          name: values.name,
          dueDay: values.dueDay,
          amount: values.amount,
          validFrom: inputToDbMonth(values.validFrom),
        })
      }
      toast.success(isEdit ? 'Uloženo' : 'Fixní náklad přidán')
      onClose()
    } catch {
      toast.error('Uložit se nepovedlo, zkus to prosím znovu.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className='rounded-2xl sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='font-chalk text-3xl font-normal text-olive'>
            {isEdit ? 'Upravit fixní náklad' : 'Nový fixní náklad'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Název a splatnost. Částku změníš tlačítkem Změnit částku.'
              : 'Pravidelná měsíční platba, třeba nájem nebo elektřina.'}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...formMethods}>
          <HookForm className='flex flex-col gap-4' onSubmit={formMethods.handleSubmit(onSubmit)}>
            <HFField
              autoFocus
              required
              field='name'
              inputType='text'
              label='Název'
              placeholder='Nájem'
            />
            {isEdit ? null : (
              <div className='grid gap-4 sm:grid-cols-2'>
                <HFField required field='amount' inputType='money' label='Měsíčně' />
                <HFField required field='validFrom' inputType='month' label='Platí od' />
              </div>
            )}
            <HFField
              className='max-w-48'
              field='dueDay'
              hint='Den v měsíci, kdy se platí. Nepovinné.'
              inputMode='numeric'
              inputType='text'
              label='Splatnost (den)'
              placeholder='5'
            />
            {isEdit && hasPayments ? (
              <p className='text-xs text-muted-foreground'>
                Tenhle náklad už má zaplacené měsíce, proto ho nejde smazat. Když už ho neplatíš,
                ukonči ho tlačítkem Změnit částku a zadej 0.
              </p>
            ) : null}
            <div className='flex flex-wrap items-center justify-between gap-3'>
              {isEdit && !hasPayments && payments ? (
                <DeleteButton
                  isPending={deleteCost.isPending}
                  label='Smazat náklad'
                  onConfirm={onDelete}
                />
              ) : (
                <span />
              )}
              <HFSubmit isPending={createCost.isPending || updateCost.isPending} />
            </div>
          </HookForm>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export default FixedCostModal
