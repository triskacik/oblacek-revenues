import { getPushSubscription, subscribeToPush, type PushKind } from '@/lib/push'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { supabase } from './supabaseClient'

export type PushDevice = { endpoint: string; mutedKinds: PushKind[] }

/**
 * This device's push subscription: lives in the browser, mirrored in `push_subscriptions`.
 * These rows are device registrations, not shop data. A browser subscription without its row
 * (e.g. removed by the server after an error) counts as off, so "Zapnout" registers it again.
 */
export const fetchPushDevice = async (): Promise<PushDevice | null> => {
  const subscription = await getPushSubscription()
  if (!subscription) return null
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('muted_kinds')
    .eq('endpoint', subscription.endpoint)
    .maybeSingle()
  if (error) throw error
  return data
    ? { endpoint: subscription.endpoint, mutedKinds: data.muted_kinds as PushKind[] }
    : null
}

export const usePushDevice = () =>
  useQuery({ queryKey: queryKeys.pushDevice.current, queryFn: fetchPushDevice })

export const useEnablePush = () => {
  const queryClient = useQueryClient()
  return useMutation({
    /** Resolves to `false` when the user didn't allow notifications. */
    mutationFn: async () => {
      const subscription = await subscribeToPush()
      if (!subscription) return false
      const keys = subscription.toJSON().keys
      if (!keys?.p256dh || !keys.auth) throw new Error('Push subscription without keys')
      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          endpoint: subscription.endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          user_agent: navigator.userAgent.slice(0, 300),
        },
        { onConflict: 'endpoint' }
      )
      if (error) {
        await subscription.unsubscribe()
        throw error
      }
      return true
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.pushDevice.current }),
  })
}

export const useDisablePush = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const subscription = await getPushSubscription()
      if (!subscription) return
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint)
      if (error) throw error
      await subscription.unsubscribe()
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.pushDevice.current }),
  })
}

const toggleKind = (device: PushDevice, kind: PushKind, muted: boolean): PushDevice => ({
  ...device,
  mutedKinds: muted
    ? [...new Set([...device.mutedKinds, kind])]
    : device.mutedKinds.filter(k => k !== kind),
})

/** Turns one kind of reminder on or off for this device (switch flips right away). */
export const useSetPushKindMuted = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      device,
      kind,
      muted,
    }: {
      device: PushDevice
      kind: PushKind
      muted: boolean
    }) => {
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ muted_kinds: toggleKind(device, kind, muted).mutedKinds })
        .eq('endpoint', device.endpoint)
      if (error) throw error
    },
    onMutate: ({ device, kind, muted }) => {
      const next: PushDevice | null = toggleKind(device, kind, muted)
      queryClient.setQueryData(queryKeys.pushDevice.current, next)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.pushDevice.current }),
  })
}

/** Sends one test notification to this device only. */
export const useSendTestPush = () =>
  useMutation({
    mutationFn: async (endpoint: string) => {
      const { error } = await supabase.functions.invoke('send-notifications', {
        body: { test: true, endpoint },
      })
      if (error) throw error
    },
  })
