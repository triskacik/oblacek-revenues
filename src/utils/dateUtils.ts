import { format, parseISO } from 'date-fns'

/** DB `date` columns travel as `yyyy-MM-dd` strings; these helpers keep them in local time. */

export const toDbDate = (date: Date) => format(date, 'yyyy-MM-dd')

export const parseDbDate = (value: string) => parseISO(value)

export const todayDbDate = () => toDbDate(new Date())

/** First day of the month as a DB date, e.g. `2026-11-01`. */
export const toDbMonth = (date: Date) => format(date, 'yyyy-MM-01')

/** `2026-11-01` ↔ `2026-11` for `<input type="month">`. */
export const dbMonthToInput = (value: string) => value.slice(0, 7)
export const inputToDbMonth = (value: string) => `${value}-01`

/** e.g. `06.11.2026` */
export const formatDate = (value: string | Date) =>
  format(typeof value === 'string' ? parseDbDate(value) : value, 'dd.MM.yyyy')

/** `18:00:00` → `18:00` */
export const formatTime = (value: string) => value.slice(0, 5)
