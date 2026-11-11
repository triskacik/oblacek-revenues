// Obláček service worker: only shows push notifications (no offline caching, the app needs live data).

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

self.addEventListener('push', event => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'Obláček', body: event.data ? event.data.text() : '' }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Obláček', {
      body: data.body || '',
      icon: '/brand/icon-192.png',
      badge: '/brand/icon-192.png',
      tag: data.tag,
      lang: 'cs',
      data: { url: data.url || '/' },
    })
  )
})

// Tapping a notification opens the right screen, reusing an open Obláček window when there is one.
self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
      const existing = windows.find(client => client.url.startsWith(self.location.origin))
      if (existing) return existing.focus().then(client => client.navigate(url))
      return self.clients.openWindow(url)
    })
  )
})
