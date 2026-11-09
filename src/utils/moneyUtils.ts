const czkFormatter = new Intl.NumberFormat('cs-CZ', {
  style: 'currency',
  currency: 'CZK',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** e.g. `12 345 Kč`, `99,50 Kč` */
export const formatMoney = (amount: number) => czkFormatter.format(amount)

/** Amount for an input field: `1234,5` (no thousands separator, Czech decimal comma). */
export const toMoneyInput = (amount: number | null | undefined) =>
  amount === null || amount === undefined ? '' : String(amount).replace('.', ',')

/**
 * Parses what people type: `1 234`, `1234,50`, `1234.5`, `1 234 Kč`.
 * Returns `null` for empty input and `NaN` for anything that is not a number.
 */
export const parseMoney = (input: string | null | undefined) => {
  const cleaned = (input ?? '').replace(/kč/i, '').replace(/[\s ]/g, '').replace(',', '.')
  if (cleaned === '') return null
  if (!/^-?\d+(\.\d{0,2})?$/.test(cleaned)) return Number.NaN
  return Number(cleaned)
}

/** Sum that stays exact for amounts with at most 2 decimals. */
export const sumMoney = (amounts: number[]) =>
  Math.round(amounts.reduce((total, amount) => total + amount * 100, 0)) / 100

const compactFormatter = new Intl.NumberFormat('cs-CZ', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

/** Short axis labels, e.g. `12 tis.` */
export const formatMoneyCompact = (amount: number) => compactFormatter.format(amount)
