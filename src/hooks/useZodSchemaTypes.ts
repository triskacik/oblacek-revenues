import { parseMoney } from '@/utils/moneyUtils'
import { todayDbDate } from '@/utils/dateUtils'
import { z } from 'zod'

type MoneyProps = {
  /** Allow 0 (e.g. a sale on a day the shop was closed, an ended fixed cost). */
  allowZero?: boolean
}

type DateProps = {
  /** Earliest allowed `yyyy-MM-dd` (e.g. the opening date). */
  min?: string | null
  /** Disallow dates after today. */
  notInFuture?: boolean
}

/**
 * Zod building blocks with Czech messages, shared by all forms (same idea as in benefit-ng-react,
 * without i18n). Money fields hold the raw input text and come out of the schema as numbers.
 */
const useZodSchemaTypes = () => {
  const zStringRequired = () => z.string().trim().min(1, 'Vyplň prosím')

  const zString = () =>
    z
      .string()
      .trim()
      .nullish()
      .transform(value => (value ? value : null))

  const zMoneyRequired = ({ allowZero = false }: MoneyProps = {}) =>
    z
      .string()
      .transform(parseMoney)
      .refine(value => value !== null, 'Zadej částku')
      .refine(value => !Number.isNaN(value), 'Tohle není částka, zkus třeba 1250 nebo 1250,50')
      .refine(value => (allowZero ? (value ?? 0) >= 0 : (value ?? 0) > 0), {
        message: allowZero ? 'Částka nemůže být záporná' : 'Částka musí být větší než 0',
      })
      .transform(value => value as number)

  const zDateRequired = ({ min, notInFuture }: DateProps = {}) =>
    z
      .string()
      .min(1, 'Vyber datum')
      .refine(value => !notInFuture || value <= todayDbDate(), 'Datum nemůže být v budoucnu')
      .refine(value => !min || value >= min, 'Tehdy ještě obchod nebyl otevřený')

  const zMonthRequired = () => z.string().regex(/^\d{4}-\d{2}$/, 'Vyber měsíc')

  const zTimeRequired = () => z.string().regex(/^\d{2}:\d{2}/, 'Zadej čas')

  return { zStringRequired, zString, zMoneyRequired, zDateRequired, zMonthRequired, zTimeRequired }
}

export default useZodSchemaTypes
