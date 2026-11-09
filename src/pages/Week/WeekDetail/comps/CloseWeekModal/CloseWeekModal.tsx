import { useReopenWeek, useSaveWeekClosing } from '@/api/weekClosings'
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
import DeleteButton from '@/pages/comps/DeleteButton/DeleteButton'
import type { Ledger } from '@/types'
import { getWeekState } from '@/utils/envelopeUtils'
import { formatMoney, parseMoney, sumMoney, toMoneyInput } from '@/utils/moneyUtils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import z from 'zod'

type Props = {
  open: boolean
  onClose: () => void
  ledger: Ledger
  /** Monday, `yyyy-MM-dd`. */
  monday: string
  weekNumber: number
  /** Payout and money for fixed costs as planned on the board (prefill for a new closing). */
  suggested: { payout: number; toFixed: number }
}

const CloseWeekModal = ({ open, onClose, ledger, monday, weekNumber, suggested }: Props) => {
  const week = getWeekState(ledger, monday)
  const closing = week.closing
  const [showOwnerTake, setShowOwnerTake] = useState(false)

  const { zMoneyRequired, zString } = useZodSchemaTypes()
  const schema = z.object({
    payout: zMoneyRequired({ allowZero: true }),
    toFixed: zMoneyRequired({ allowZero: true }),
    ownerTake: zMoneyRequired({ allowZero: true }),
    note: zString(),
  })

  const formMethods = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!open) return
    formMethods.reset({
      payout: toMoneyInput(closing?.seller_payout ?? suggested.payout),
      toFixed: toMoneyInput(closing?.to_fixed ?? suggested.toFixed),
      ownerTake: toMoneyInput(closing?.owner_take ?? 0),
      note: closing?.note ?? '',
    })
    setShowOwnerTake((closing?.owner_take ?? 0) > 0)
    // Prefill only when the dialog opens, not on every background refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const [payout, toFixed, ownerTake] = useWatch({
    control: formMethods.control,
    name: ['payout', 'toFixed', 'ownerTake'],
  })
  const toNumber = (value: string | undefined) => {
    const parsed = parseMoney(value)
    return parsed === null || Number.isNaN(parsed) ? 0 : parsed
  }
  const rest = sumMoney([
    week.available,
    -toNumber(payout),
    -toNumber(toFixed),
    -toNumber(ownerTake),
  ])

  const save = useSaveWeekClosing()
  const reopen = useReopenWeek()

  const onSubmit = async (values: z.output<typeof schema>) => {
    try {
      await save.mutateAsync({
        week_start: monday,
        seller_payout: values.payout,
        to_fixed: values.toFixed,
        owner_take: values.ownerTake,
        surplus_at_close: week.surplus,
        note: values.note,
      })
      toast.success(closing ? 'Uzávěrka upravena' : `Týden ${weekNumber} uzavřen`, {
        description: `Prodavačce ${formatMoney(values.payout)}`,
      })
      onClose()
    } catch {
      toast.error('Uložit se nepovedlo, zkus to prosím znovu.')
    }
  }

  const onReopen = async () => {
    try {
      await reopen.mutateAsync(monday)
      toast.success(`Týden ${weekNumber} je zase otevřený`)
      onClose()
    } catch {
      toast.error('Nepovedlo se, zkus to prosím znovu.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className='rounded-2xl sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='font-chalk text-3xl font-normal text-olive'>
            {closing ? `Uzávěrka týdne ${weekNumber}` : `Uzavřít týden ${weekNumber}`}
          </DialogTitle>
          <DialogDescription>
            K dispozici je {formatMoney(week.available)}. Zapiš, kolik jsi dala prodavačce a kolik
            odkládáš na fixní náklady. Zbytek zůstane na nákupy.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...formMethods}>
          <HookForm className='flex flex-col gap-4' onSubmit={formMethods.handleSubmit(onSubmit)}>
            <HFField
              autoFocus
              required
              field='payout'
              inputType='money'
              label='Vyplaceno prodavačce'
            />
            <HFField
              required
              field='toFixed'
              hint='Na nájem a další fixní platby.'
              inputType='money'
              label='Odkládám na fixní náklady'
            />
            {showOwnerTake ? (
              <HFField field='ownerTake' inputType='money' label='Vzala jsem si' />
            ) : (
              <button
                className='self-start text-sm text-muted-foreground underline-offset-4 hover:underline'
                type='button'
                onClick={() => setShowOwnerTake(true)}
              >
                + Vzala jsem si něco pro sebe
              </button>
            )}
            <HFField field='note' inputType='text' label='Poznámka' placeholder='Nepovinné' />

            <div
              className={cn(
                'flex items-center justify-between rounded-xl px-4 py-3 text-sm',
                rest < 0 ? 'bg-terracotta-soft text-accent-foreground' : 'bg-sage-soft'
              )}
            >
              <span className='font-semibold'>
                {rest < 0 ? 'Na nákupy by chybělo' : 'Na nákupy zůstane'}
              </span>
              <span className='text-base font-bold tabular-nums'>
                {formatMoney(Math.abs(rest))}
              </span>
            </div>

            <div className='flex flex-wrap items-center justify-between gap-3'>
              {closing ? (
                <DeleteButton
                  isPending={reopen.isPending}
                  label='Zrušit uzávěrku'
                  question='Opravdu zrušit?'
                  onConfirm={onReopen}
                />
              ) : (
                <span />
              )}
              <HFSubmit isPending={save.isPending}>{closing ? 'Uložit' : 'Uzavřít týden'}</HFSubmit>
            </div>
          </HookForm>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export default CloseWeekModal
