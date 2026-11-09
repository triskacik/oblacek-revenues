import {
  addDays,
  addMonths,
  addWeeks,
  format,
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

/** e.g. `10.–16. 11. 2026` or `27. 10. – 2. 11. 2026` */
export const formatWeekRange = (monday: Date) => {
  const sunday = addDays(monday, 6)
  if (monday.getMonth() === sunday.getMonth()) {
    return `${format(monday, 'd.')}–${format(sunday, 'd. M. yyyy')}`
  }
  if (monday.getFullYear() === sunday.getFullYear()) {
    return `${format(monday, 'd. M.')} – ${format(sunday, 'd. M. yyyy')}`
  }
  return `${format(monday, 'd. M. yyyy')} – ${format(sunday, 'd. M. yyyy')}`
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
