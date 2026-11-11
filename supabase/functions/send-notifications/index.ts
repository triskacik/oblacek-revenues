// Obláček — sends push notifications (docs/DESIGN.md → Notifikácie).
//
// Called every 15 minutes by pg_cron (header `x-cron-secret`), it decides in Europe/Prague time
// which of the four reminders are due and sends each one once (keys in `notification_log`):
//   1. missing daily sale   - open day, after settings.reminder_time (default 20:00)
//   2. week ended, close it - Saturday evening, week not closed
//   3. week without expense - Sunday evening, week has sales but no expense (unless hidden)
//   4. fixed cost due       - the evening before its due date, unless already paid
// Each device can turn kinds off (`push_subscriptions.muted_kinds`).
// A signed-in allowed user can also ask for a test notification to their own device.
//
// Reads data with the service role (server side only) and never changes shop data; it only
// writes `notification_log` and removes expired device subscriptions.

import { createClient } from 'npm:@supabase/supabase-js@2.119.0'
import webpush from 'npm:web-push@3.6.7'

const TIME_ZONE = 'Europe/Prague'
const EVENING = '19:00'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Kind = 'sale' | 'close' | 'noexp' | 'due'

type Notice = { kind: Kind | 'test'; key: string; title: string; body: string; url: string }

type Subscription = {
  id: string
  endpoint: string
  p256dh: string
  auth: string
  muted_kinds: string[]
}

// ---------------------------------------------------------------------------------------------
// Dates as `yyyy-MM-dd` strings, computed in UTC so there are no DST surprises.

const addDays = (date: string, days: number) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/** ISO weekday, 1 = Monday … 7 = Sunday. */
const isoWeekday = (date: string) => {
  const [y, m, d] = date.split('-').map(Number)
  return ((new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7) + 1
}

const mondayOf = (date: string) => addDays(date, 1 - isoWeekday(date))

/** ISO week id, e.g. `2026-W46`. */
const weekId = (date: string) => {
  const thursday = addDays(mondayOf(date), 3)
  const year = Number(thursday.slice(0, 4))
  const firstThursday = addDays(mondayOf(`${year}-01-04`), 3)
  const week = 1 + Math.round((Date.parse(thursday) - Date.parse(firstThursday)) / (7 * 86_400_000))
  return `${year}-W${String(week).padStart(2, '0')}`
}

const daysInMonth = (month: string) => {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

/** Current date and time in Prague. */
const pragueNow = () => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date())
      .map(part => [part.type, part.value])
  )
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  }
}

// ---------------------------------------------------------------------------------------------

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const sendToAll = async (
  admin: ReturnType<typeof createClient>,
  subscriptions: Subscription[],
  notice: Notice
) => {
  let delivered = 0
  const recipients = subscriptions.filter(
    subscription => notice.kind === 'test' || !subscription.muted_kinds.includes(notice.kind)
  )
  for (const subscription of recipients) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        JSON.stringify({
          title: notice.title,
          body: notice.body,
          url: notice.url,
          tag: notice.key,
        }),
        { TTL: 6 * 3600 }
      )
      delivered++
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode
      // The device unsubscribed or the app was removed: forget it.
      if (status === 404 || status === 410) {
        await admin.from('push_subscriptions').delete().eq('id', subscription.id)
      } else {
        console.error('push failed', status, (error as Error).message)
      }
    }
  }
  return delivered
}

/** Which reminders are due right now. */
const collectNotices = async (admin: ReturnType<typeof createClient>): Promise<Notice[]> => {
  const { date: today, time } = pragueNow()
  const weekday = isoWeekday(today)
  const monday = mondayOf(today)
  const sunday = addDays(monday, 6)
  const tomorrow = addDays(today, 1)
  const tomorrowMonth = `${tomorrow.slice(0, 7)}-01`

  const { data: settings, error } = await admin.from('settings').select('*').eq('id', 1).single()
  if (error) throw error
  if (!settings.opening_date) return []
  const openDays: number[] = settings.open_days
  const reminderTime = String(settings.reminder_time).slice(0, 5)

  const [sales, expenses, closings, costs, payments, dismissed] = await Promise.all([
    admin.from('sales').select('date, amount').gte('date', monday).lte('date', sunday),
    admin.from('expenses').select('date').gte('date', monday).lte('date', sunday),
    admin.from('week_closings').select('week_start').eq('week_start', monday),
    admin.from('fixed_costs').select('id, name, due_day, fixed_cost_amounts(valid_from, amount)'),
    admin.from('fixed_cost_payments').select('fixed_cost_id, month').eq('month', tomorrowMonth),
    admin.from('dismissed_alerts').select('id'),
  ])
  for (const result of [sales, expenses, closings, costs, payments, dismissed]) {
    if (result.error) throw result.error
  }

  const notices: Notice[] = []
  const thisWeek = weekId(today)
  const weekNumber = Number(thisWeek.split('-W')[1])

  // 1. Missing daily sale.
  if (
    openDays.includes(weekday) &&
    today >= settings.opening_date &&
    time >= reminderTime &&
    !sales.data!.some(sale => sale.date === today)
  ) {
    notices.push({
      kind: 'sale',
      key: `sale-${today}`,
      title: 'Nezapomeň zapsat dnešní tržbu',
      body: 'Stačí jedno číslo, v Obláčku na Týdnu u dnešního dne.',
      url: `/week/${thisWeek}`,
    })
  }

  const weekHasOpenDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i)).some(
    day => openDays.includes(isoWeekday(day)) && day >= settings.opening_date
  )

  // 2. Week ended, close it (Saturday evening).
  if (weekday === 6 && time >= EVENING && weekHasOpenDays && closings.data!.length === 0) {
    notices.push({
      kind: 'close',
      key: `close-${monday}`,
      title: `Týden ${weekNumber} skončil`,
      body: 'Zapiš, kolik jsi dala prodavačce, a uzavři ho.',
      url: `/week/${thisWeek}`,
    })
  }

  // 3. A week of sales without a single expense (Sunday evening), unless Sára hid that alert.
  const weekSales = sales.data!.reduce((total, sale) => total + Number(sale.amount), 0)
  if (
    weekday === 7 &&
    time >= EVENING &&
    weekSales > 0 &&
    expenses.data!.length === 0 &&
    !dismissed.data!.some(row => row.id === `no-expenses-${monday}`)
  ) {
    notices.push({
      kind: 'noexp',
      key: `noexp-${monday}`,
      title: `Týden ${weekNumber} nemá žádný výdaj`,
      body: 'Nezapomněla jsi něco zapsat?',
      url: `/week/${thisWeek}`,
    })
  }

  // 4. Fixed cost due tomorrow (evening before), if it has a due day and isn't paid yet.
  if (time >= EVENING) {
    for (const cost of costs.data!) {
      if (!cost.due_day) continue
      const amounts = (cost.fixed_cost_amounts as { valid_from: string; amount: number }[])
        .filter(amount => amount.valid_from <= tomorrowMonth)
        .sort((a, b) => a.valid_from.localeCompare(b.valid_from))
      const amount = amounts.length ? Number(amounts[amounts.length - 1].amount) : 0
      if (amount <= 0) continue
      const dueDate = `${tomorrow.slice(0, 8)}${String(Math.min(cost.due_day, daysInMonth(tomorrow))).padStart(2, '0')}`
      const paid = payments.data!.some(payment => payment.fixed_cost_id === cost.id)
      if (
        dueDate === tomorrow &&
        !paid &&
        tomorrowMonth >= settings.opening_date.slice(0, 7) + '-01'
      ) {
        notices.push({
          kind: 'due',
          key: `due-${cost.id}-${tomorrow}`,
          title: `Zítra je splatný ${cost.name}`,
          body: 'Až zaplatíš, odškrtni ho v Obláčku.',
          url: `/month/${tomorrow.slice(0, 7)}`,
        })
      }
    }
  }

  return notices
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  webpush.setVapidDetails(
    Deno.env.get('VAPID_SUBJECT')!,
    Deno.env.get('VAPID_PUBLIC_KEY')!,
    Deno.env.get('VAPID_PRIVATE_KEY')!
  )

  const body = await request.json().catch(() => ({}))

  // Test notification for the caller's own device (Settings → "Poslat zkušební upozornění").
  if (body.test) {
    const authorization = request.headers.get('Authorization') ?? ''
    const asUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authorization } },
    })
    const { data: allowed } = await asUser.rpc('is_allowed_user')
    if (!allowed) return json({ error: 'forbidden' }, 403)
    const { data: subscription } = await admin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth, muted_kinds')
      .eq('endpoint', String(body.endpoint ?? ''))
      .maybeSingle()
    if (!subscription) return json({ error: 'unknown device' }, 404)
    const delivered = await sendToAll(admin, [subscription], {
      kind: 'test',
      key: 'test',
      title: 'Ahoj od Obláčku',
      body: 'Upozornění fungují. Takhle ti připomenu, co je potřeba.',
      url: '/',
    })
    return json({ delivered })
  }

  // Scheduled run.
  if (request.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) {
    return json({ error: 'forbidden' }, 403)
  }

  const notices = await collectNotices(admin)
  if (notices.length === 0) return json({ sent: [] })

  const { data: alreadySent, error: logError } = await admin
    .from('notification_log')
    .select('key')
    .in(
      'key',
      notices.map(notice => notice.key)
    )
  if (logError) throw logError
  const pending = notices.filter(notice => !alreadySent!.some(row => row.key === notice.key))
  if (pending.length === 0) return json({ sent: [] })

  const { data: subscriptions, error: subscriptionsError } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth, muted_kinds')
  if (subscriptionsError) throw subscriptionsError

  const sent: string[] = []
  for (const notice of pending) {
    await sendToAll(admin, subscriptions ?? [], notice)
    // Logged even without devices, so a phone subscribed later doesn't get stale reminders.
    await admin.from('notification_log').insert({ key: notice.key })
    sent.push(notice.key)
  }
  return json({ sent })
})
