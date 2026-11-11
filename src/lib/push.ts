/**
 * Browser side of push notifications (docs/DESIGN.md → Notifikácie). The server side is the
 * `send-notifications` Edge Function; this only asks for permission and manages this device.
 */

const SERVICE_WORKER_URL = '/sw.js'

export const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY

export const isPushSupported = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

/** iPhone / iPad: push works only for the app added to the home screen (iOS 16.4+). */
export const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export const isInstalledApp = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

export const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(SERVICE_WORKER_URL).catch(() => {
      // Notifications just stay unavailable; the app itself works without the worker.
    })
  })
}

export const getPushSubscription = async () => {
  if (!isPushSupported()) return null
  const registration = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_URL)
  return (await registration?.pushManager.getSubscription()) ?? null
}

const toUint8Array = (base64Url: string) => {
  const base64 = (base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  return Uint8Array.from(atob(base64), char => char.charCodeAt(0))
}

/** Asks for permission (must run from a tap) and subscribes this device. */
export const subscribeToPush = async () => {
  if (!vapidPublicKey) throw new Error('VITE_VAPID_PUBLIC_KEY is missing')
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null
  const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL)
  await navigator.serviceWorker.ready
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: toUint8Array(vapidPublicKey),
  })
}

/** The four reminders the server sends (kinds match `push_subscriptions.muted_kinds`). */
export const pushReminders = [
  {
    kind: 'sale',
    title: 'Chybí dnešní tržba',
    when: 'v otevřené dny večer, čas si zvolíš v Nastavení',
  },
  { kind: 'close', title: 'Týden skončil, uzavři ho', when: 'v sobotu večer' },
  { kind: 'noexp', title: 'Týden nemá žádný výdaj', when: 'v neděli večer' },
  {
    kind: 'due',
    title: 'Zítra je splatná platba',
    when: 'večer před splatností, když ji náklad má',
  },
] as const

export type PushKind = (typeof pushReminders)[number]['kind']
