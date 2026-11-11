import { useDismissedAlertIds, useRestoreDismissedAlerts } from '@/api/dismissedAlerts'
import { Button, Spinner } from '@/components/ui'
import { toast } from '@/lib/toast'
import { EyeOff, RotateCcw } from 'lucide-react'
import SettingsSection from '../SettingsSection/SettingsSection'

/** Brings back the "is this right?" hints Sára hid in "Co je potřeba udělat". */
const HiddenAlertsCard = () => {
  const { data: ids } = useDismissedAlertIds()
  const restore = useRestoreDismissedAlerts()
  const count = ids?.length ?? 0

  const onRestore = async () => {
    try {
      await restore.mutateAsync()
      toast.success('Skrytá upozornění se zase ukážou')
    } catch {
      toast.error('Nepovedlo se, zkus to prosím znovu.')
    }
  }

  return (
    <SettingsSection
      description='Upozornění, která jsi skryla v „Co je potřeba udělat“.'
      icon={EyeOff}
      title='Skrytá upozornění'
    >
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='text-sm text-muted-foreground'>
          {count === 0
            ? 'Žádná skrytá upozornění.'
            : `Skrytých upozornění: ${count}. Pokud pořád platí, zase se ukážou.`}
        </p>
        {count > 0 ? (
          <Button
            className='rounded-full'
            disabled={restore.isPending}
            size='sm'
            variant='secondary'
            onClick={onRestore}
          >
            {restore.isPending ? <Spinner /> : <RotateCcw />} Zobrazit znovu
          </Button>
        ) : null}
      </div>
    </SettingsSection>
  )
}

export default HiddenAlertsCard
