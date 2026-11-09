import { useUpdateSettings } from '@/api/settings'
import { HFField, HFSubmit, HookForm } from '@/components'
import useZodSchemaTypes from '@/hooks/useZodSchemaTypes'
import { toast } from '@/lib/toast'
import type { Settings } from '@/types'
import { formatTime } from '@/utils/dateUtils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Store } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import z from 'zod'
import SettingsSection from '../SettingsSection/SettingsSection'

type Props = {
  settings: Settings
}

const OpeningHoursCard = ({ settings }: Props) => {
  const { zTimeRequired } = useZodSchemaTypes()
  const schema = z.object({
    openDays: z.array(z.number().int().min(1).max(7)).min(1, 'Vyber aspoň jeden den'),
    closingTime: zTimeRequired(),
  })

  const formMethods = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    values: {
      openDays: settings.open_days,
      closingTime: formatTime(settings.closing_time),
    },
  })

  const updateSettings = useUpdateSettings()

  const onSubmit = async (values: z.output<typeof schema>) => {
    try {
      await updateSettings.mutateAsync({
        open_days: values.openDays,
        closing_time: values.closingTime,
      })
      toast.success('Uloženo')
    } catch {
      toast.error('Uložit se nepovedlo, zkus to prosím znovu.')
    }
  }

  return (
    <SettingsSection
      description='Aplikace řeší jen dny, kdy máš otevřeno.'
      icon={Store}
      title='Otevírací doba'
    >
      <FormProvider {...formMethods}>
        <HookForm className='flex flex-col gap-4' onSubmit={formMethods.handleSubmit(onSubmit)}>
          <HFField field='openDays' inputType='weekdays' label='Otevřeno' />
          <HFField
            required
            className='max-w-48'
            field='closingTime'
            hint='Až potom tě upozorním, že chybí dnešní tržba.'
            inputType='time'
            label='Zavíráš v'
          />
          <div className='flex justify-end'>
            <HFSubmit isPending={updateSettings.isPending} />
          </div>
        </HookForm>
      </FormProvider>
    </SettingsSection>
  )
}

export default OpeningHoursCard
