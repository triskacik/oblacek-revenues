import { useDismissedAlertIds } from '@/api/dismissedAlerts'
import { getAlerts } from '@/utils/alertsUtils'
import { todayDbDate } from '@/utils/dateUtils'
import { getMonthTracker } from '@/utils/trackerUtils'
import useLedger from './useLedger'

/**
 * Today's status of the shop: the current month's tracker and the open to-dos. Shared by the
 * header tracker and the week page, so both always agree.
 */
const useShopStatus = () => {
  const { ledger, isPending, isError } = useLedger()
  const dismissed = useDismissedAlertIds()

  // A failing hide-list must not hide the to-dos; it just shows everything.
  const alerts =
    ledger && !dismissed.isPending ? getAlerts(ledger, new Date(), dismissed.data ?? []) : null
  const tracker = ledger ? getMonthTracker(ledger, todayDbDate()) : null

  return { ledger, alerts, tracker, isPending, isError }
}

export default useShopStatus
