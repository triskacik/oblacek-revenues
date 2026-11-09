import {
  addDays,
  addMonths,
  addWeeks,
  format,
  getISODay,
  getISOWeek,
  getISOWeekYear,
  isValid,
  parse,
  setISOWeek,
  startOfISOWeek,
  startOfMonth,
} from 'date-fns'
import { cs } from 'date-fns/locale'

/**
 * Period identifiers used in URLs:
 * - week:  ISO week, Monday–Sunday, e.g. `2026-W46`
 * - month: `2026-11`
 * A week belongs to the month that contains its Thursday (ISO rule, see docs/DESIGN.md).
 */

const WEEK_ID_REGEX = /^(\d{4})-W(\d{2})$/
const MONTH_ID_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/

// Week

export const toWeekId = (date: Date) =>
  `${getISOWeekYear(date)}-W${String(getISOWeek(date)).padStart(2, '0')}`

export const getCurrentWeekId = () => toWeekId(new Date())

/** Monday of the given ISO week, or `null` when the id is malformed or out of range. */
export const parseWeekId = (weekId: string) => {
  const match = WEEK_ID_REGEX.exec(weekId)
  if (!match) return null
  // 4 January is always in ISO week 1 of its ISO year.
  const monday = startOfISOWeek(setISOWeek(new Date(Number(match[1]), 0, 4), Number(match[2])))
  return toWeekId(monday) === weekId ? monday : null
}

export const isValidWeekId = (weekId: string) => parseWeekId(weekId) !== null

export const shiftWeekId = (weekId: string, delta: number) => {
  const monday = parseWeekId(weekId)
  return monday ? toWeekId(addWeeks(monday, delta)) : getCurrentWeekId()
}

export const getWeekDays = (monday: Date) => Array.from({ length: 7 }, (_, i) => addDays(monday, i))

export const getWeekMonthId = (monday: Date) => toMonthId(addDays(monday, 3))

/** ISO weekdays (1 = Monday … 7 = Sunday) the shop is open. Mirrors the DB default of settings.open_days. */
export const DEFAULT_OPEN_DAYS = [1, 2, 3, 4, 5]

/** Days of the week the shop is open, in order. */
export const getOpenWeekDays = (monday: Date, openDays: number[] = DEFAULT_OPEN_DAYS) =>
  getWeekDays(monday).filter(day => openDays.includes(getISODay(day)))

/**
 * Range of the open days of the week, e.g. `02.11.–06.11.2026` or `28.12.2026 – 01.01.2027`.
 * Falls back to Monday–Sunday when no day is open.
 */
export const formatWeekRange = (monday: Date, openDays: number[] = DEFAULT_OPEN_DAYS) => {
  const days = getOpenWeekDays(monday, openDays)
  const first = days[0] ?? monday
  const last = days[days.length - 1] ?? addDays(monday, 6)
  if (first.getFullYear() === last.getFullYear()) {
    return `${format(first, 'dd.MM.')}–${format(last, 'dd.MM.yyyy')}`
  }
  return `${format(first, 'dd.MM.yyyy')} – ${format(last, 'dd.MM.yyyy')}`
}

// Month

export const toMonthId = (date: Date) => format(date, 'yyyy-MM')

export const getCurrentMonthId = () => toMonthId(new Date())

/** First day of the month, or `null` when the id is malformed. */
export const parseMonthId = (monthId: string) => {
  if (!MONTH_ID_REGEX.test(monthId)) return null
  const date = parse(monthId, 'yyyy-MM', new Date())
  return isValid(date) ? startOfMonth(date) : null
}

export const isValidMonthId = (monthId: string) => parseMonthId(monthId) !== null

export const shiftMonthId = (monthId: string, delta: number) => {
  const first = parseMonthId(monthId)
  return first ? toMonthId(addMonths(first, delta)) : getCurrentMonthId()
}

/** e.g. `listopad 2026` */
export const formatMonth = (firstDay: Date) => format(firstDay, 'LLLL yyyy', { locale: cs })

/** Mondays of the weeks that belong to the month (by their Thursday). */
export const getMonthWeekStarts = (firstDay: Date) => {
  const monthId = toMonthId(firstDay)
  const mondays: Date[] = []
  let monday = startOfISOWeek(firstDay)
  if (getWeekMonthId(monday) !== monthId) monday = addWeeks(monday, 1)
  while (getWeekMonthId(monday) === monthId) {
    mondays.push(monday)
    monday = addWeeks(monday, 1)
  }
  return mondays
}

/** e.g. `po 02.11.` */
export const formatDayShort = (date: Date) => format(date, 'EEEEEE dd.MM.', { locale: cs })
