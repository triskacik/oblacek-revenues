import { useUpdateSettings } from '@/api/settings'
import { HFField, HFSubmit, HookForm } from '@/components'
import useZodSchemaTypes from '@/hooks/useZodSchemaTypes'
import { toast } from '@/lib/toast'
import type { Settings } from '@/types'
import { toMoneyInput } from '@/utils/moneyUtils'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarCheck } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import z from 'zod'
import SettingsSection from '../SettingsSection/SettingsSection'

type Props = {
  settings: Settings
}

const OpeningCard = ({ settings }: Props) => {
  const { zDateRequired, zMoneyRequired } = useZodSchemaTypes()
  const schema = z.object({
    openingDate: zDateRequired({ notInFuture: true }),
    openingFixed: zMoneyRequired({ allowZero: true }),
    openingPurchases: zMoneyRequired({ allowZero: true }),
  })

  const formMethods = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    values: {
      openingDate: settings.opening_date ?? '',
      openingFixed: toMoneyInput(settings.opening_fixed),
      openingPurchases: toMoneyInput(settings.opening_purchases),
    },
  })

  const updateSettings = useUpdateSettings()

  const onSubmit = async (values: z.output<typeof schema>) => {
    try {
      await updateSettings.mutateAsync({
        opening_date: values.openingDate,
        opening_fixed: values.openingFixed,
        opening_purchases: values.openingPurchases,
      })
      toast.success('Uloženo')
    } catch {
      toast.error('Uložit se nepovedlo, zkus to prosím znovu.')
    }
  }

  return (
    <SettingsSection
      description='Od kdy aplikaci používáš a kolik peněz obchod v ten den měl.'
      icon={CalendarCheck}
      title='Začátek'
    >
      <FormProvider {...formMethods}>
        <HookForm className='flex flex-col gap-4' onSubmit={formMethods.handleSubmit(onSubmit)}>
          <HFField
            required
            field='openingDate'
            hint='Den, kdy obchod otevřel. Starší dny aplikace neřeší.'
            inputType='date'
            label='Obchod otevřel'
          />
          <div className='grid gap-4 sm:grid-cols-2'>
            <HFField
              field='openingFixed'
              hint='Peníze už odložené na nájem a spol.'
              inputType='money'
              label='Odloženo na fixní náklady'
            />
            <HFField
              field='openingPurchases'
              hint='Peníze na nákup zboží.'
              inputType='money'
              label='Na nákupy'
            />
          </div>
          <div className='flex justify-end'>
            <HFSubmit isPending={updateSettings.isPending} />
          </div>
        </HookForm>
      </FormProvider>
    </SettingsSection>
  )
}

export default OpeningCard
