import {
  useDisablePush,
  useEnablePush,
  usePushDevice,
  useSendTestPush,
  useSetPushKindMuted,
} from '@/api/pushSubscriptions'
import { useUpdateSettings } from '@/api/settings'
import { HFField, HFSubmit, HookForm } from '@/components'
import { Button, Spinner, Switch } from '@/components/ui'
import useZodSchemaTypes from '@/hooks/useZodSchemaTypes'
import {
  isInstalledApp,
  isIos,
  isPushSupported,
  pushReminders,
  vapidPublicKey,
  type PushKind,
} from '@/lib/push'
import { toast } from '@/lib/toast'
import type { Settings } from '@/types'
import { formatTime } from '@/utils/dateUtils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bell, BellOff, Send, Smartphone } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import z from 'zod'
import SettingsSection from '../SettingsSection/SettingsSection'

type Props = {
  settings: Settings
}

/** Why this device can't turn notifications on, if it can't. */
const getDeviceHint = () => {
  if (isIos() && !isInstalledApp()) {
    return 'Na iPhonu chodí upozornění jen do aplikace z plochy. V Safari klepni na Sdílet, pak Přidat na plochu, otevři Obláček z plochy a zapni je tam.'
  }
  if (!isPushSupported()) return 'Tenhle prohlížeč upozornění neumí.'
  if (Notification.permission === 'denied') {
    return 'Upozornění jsou pro Obláček zakázaná. Povol je v nastavení prohlížeče nebo telefonu a vrať se sem.'
  }
  return null
}

const NotificationsCard = ({ settings }: Props) => {
  const { data: device, isPending: isDevicePending } = usePushDevice()
  const enablePush = useEnablePush()
  const disablePush = useDisablePush()
  const setKindMuted = useSetPushKindMuted()
  const sendTest = useSendTestPush()
  const deviceHint = getDeviceHint()
  const isBusy = enablePush.isPending || disablePush.isPending
  const canEnable = !deviceHint && Boolean(vapidPublicKey)

  const { zTimeRequired } = useZodSchemaTypes()
  const schema = z.object({ reminderTime: zTimeRequired() })

  const formMethods = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    values: { reminderTime: formatTime(settings.reminder_time) },
  })

  const updateSettings = useUpdateSettings()

  const onSubmit = async (values: z.output<typeof schema>) => {
    try {
      await updateSettings.mutateAsync({ reminder_time: values.reminderTime })
      toast.success('Uloženo')
    } catch {
      toast.error('Uložit se nepovedlo, zkus to prosím znovu.')
    }
  }

  const onEnable = async () => {
    try {
      const allowed = await enablePush.mutateAsync()
      if (allowed) toast.success('Upozornění jsou zapnutá')
      else toast.info('Bez povolení ti upozornění poslat nemůžu.')
    } catch {
      toast.error('Zapnout se nepovedlo, zkus to prosím znovu.')
    }
  }

  const onDisable = async () => {
    try {
      await disablePush.mutateAsync()
      toast.success('Na tomhle zařízení už upozornění nepřijdou')
    } catch {
      toast.error('Vypnout se nepovedlo, zkus to prosím znovu.')
    }
  }

  const onToggleKind = async (kind: PushKind, enabled: boolean) => {
    if (!device) return
    try {
      await setKindMuted.mutateAsync({ device, kind, muted: !enabled })
    } catch {
      toast.error('Uložit se nepovedlo, zkus to prosím znovu.')
    }
  }

  const onTest = async () => {
    if (!device) return
    try {
      await sendTest.mutateAsync(device.endpoint)
      toast.success('Zkouška odeslaná, za chvilku by měla přijít')
    } catch {
      toast.error('Zkoušku se nepovedlo poslat.')
    }
  }

  const footnote = device
    ? 'Vyber, která upozornění mají chodit na tohle zařízení.'
    : (deviceHint ?? (canEnable ? 'Zapni je na každém zařízení, kam mají chodit.' : null))

  return (
    <SettingsSection
      description='Připomenu ti, co je potřeba, i když aplikaci zrovna nemáš otevřenou.'
      icon={Bell}
      title='Upozornění'
    >
      <div className='flex flex-col gap-5'>
        <div className='rounded-xl bg-secondary/60 p-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <p className='flex items-center gap-2 text-sm font-semibold'>
              <Smartphone className='size-4 text-olive-soft' />
              {isDevicePending
                ? 'Zjišťuju…'
                : device
                  ? 'Na tomhle zařízení jsou zapnutá'
                  : 'Na tomhle zařízení jsou vypnutá'}
            </p>
            {device ? (
              <div className='flex flex-wrap gap-2'>
                <Button
                  className='rounded-full'
                  disabled={sendTest.isPending}
                  size='sm'
                  variant='secondary'
                  onClick={onTest}
                >
                  {sendTest.isPending ? <Spinner /> : <Send />} Poslat zkoušku
                </Button>
                <Button
                  className='rounded-full'
                  disabled={isBusy}
                  size='sm'
                  variant='ghost'
                  onClick={onDisable}
                >
                  {disablePush.isPending ? <Spinner /> : <BellOff />} Vypnout
                </Button>
              </div>
            ) : canEnable && !isDevicePending ? (
              <Button className='rounded-full' disabled={isBusy} size='sm' onClick={onEnable}>
                {enablePush.isPending ? <Spinner /> : <Bell />} Zapnout
              </Button>
            ) : null}
          </div>
          {footnote ? <p className='mt-2 text-sm text-muted-foreground'>{footnote}</p> : null}
        </div>

        <ul className='flex flex-col gap-3 text-sm'>
          {pushReminders.map(reminder => {
            const id = `push-kind-${reminder.kind}`
            const when =
              reminder.kind === 'sale'
                ? `v otevřené dny v ${formatTime(settings.reminder_time)}`
                : reminder.when
            return (
              <li className='flex items-center justify-between gap-4' key={reminder.kind}>
                <label className='flex flex-col' htmlFor={device ? id : undefined}>
                  <span className='font-semibold'>{reminder.title}</span>
                  <span className='text-muted-foreground'>{when}</span>
                </label>
                {device ? (
                  <Switch
                    checked={!device.mutedKinds.includes(reminder.kind)}
                    id={id}
                    onCheckedChange={checked => onToggleKind(reminder.kind, checked)}
                  />
                ) : null}
              </li>
            )
          })}
        </ul>

        <FormProvider {...formMethods}>
          <HookForm
            className='flex flex-wrap items-end justify-between gap-4'
            onSubmit={formMethods.handleSubmit(onSubmit)}
          >
            <HFField
              required
              className='max-w-48'
              field='reminderTime'
              inputType='time'
              label='Připomenout tržbu v'
            />
            <HFSubmit isPending={updateSettings.isPending} />
          </HookForm>
        </FormProvider>
      </div>
    </SettingsSection>
  )
}

export default NotificationsCard
