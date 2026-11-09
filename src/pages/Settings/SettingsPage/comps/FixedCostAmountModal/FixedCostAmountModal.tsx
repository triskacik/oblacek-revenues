import { useSetFixedCostAmount } from '@/api/fixedCosts'
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
import type { FixedCostWithAmounts } from '@/types'
import { dbMonthToInput, inputToDbMonth, toDbMonth } from '@/utils/dateUtils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import z from 'zod'

type Props = {
  open: boolean
  onClose: () => void
  cost: FixedCostWithAmounts | null
}

const FixedCostAmountModal = ({ open, onClose, cost }: Props) => {
  const { zMoneyRequired, zMonthRequired } = useZodSchemaTypes()
  const schema = z.object({
    validFrom: zMonthRequired(),
    amount: zMoneyRequired({ allowZero: true }),
  })

  const formMethods = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!open) return
    formMethods.reset({ validFrom: dbMonthToInput(toDbMonth(new Date())), amount: '' })
  }, [open, formMethods])

  const setAmount = useSetFixedCostAmount()

  const onSubmit = async (values: z.output<typeof schema>) => {
    if (!cost) return
    try {
      await setAmount.mutateAsync({
        fixedCostId: cost.id,
        validFrom: inputToDbMonth(values.validFrom),
        amount: values.amount,
      })
      toast.success(values.amount === 0 ? 'Náklad ukončen' : 'Nová částka uložena')
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
            {cost?.name}: nová částka
          </DialogTitle>
          <DialogDescription>
            Od zvoleného měsíce platí nová částka, dřívější měsíce zůstanou, jak byly. Když už
            neplatíš, zadej 0.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...formMethods}>
          <HookForm className='flex flex-col gap-4' onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div className='grid gap-4 sm:grid-cols-2'>
              <HFField required field='validFrom' inputType='month' label='Od měsíce' />
              <HFField autoFocus required field='amount' inputType='money' label='Měsíčně' />
            </div>
            <div className='flex justify-end'>
              <HFSubmit isPending={setAmount.isPending} />
            </div>
          </HookForm>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export default FixedCostAmountModal
