import { parseDbDate } from './dateUtils'
import { formatMoney } from './moneyUtils'
import type { MonthTracker } from './trackerUtils'
import { formatMonth } from './weekUtils'

/** Month name in nominative, lower case: `listopad`. */
export const monthName = (month: string) => formatMonth(parseDbDate(month)).split(' ')[0]

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/** Czech plural for weeks: 1 týden, 2-4 týdny, 5+ týdnů. */
export const weeksWord = (count: number) => (count === 1 ? 'týden' : count <= 4 ? 'týdny' : 'týdnů')

/** Czech plural for "things waiting": 1 věc čeká, 2-4 věci čekají, 5+ věcí čeká. */
export const todoText = (count: number) =>
  count === 0
    ? 'Nic nečeká'
    : `${count} ${count === 1 ? 'věc čeká' : count <= 4 ? 'věci čekají' : 'věcí čeká'}`

/** Where we are in the month, e.g. "ještě 2 týdny do konce měsíce". */
export const getPeriodText = (tracker: MonthTracker) => {
  if (tracker.phase === 'past') return 'Měsíc skončil'
  if (tracker.phase === 'future') return 'Měsíc teprve začne'
  const left = tracker.weeksLeft - 1
  return left > 0 ? `Ještě ${left} ${weeksWord(left)} do konce měsíce` : 'Poslední týden měsíce'
}

/** One friendly sentence about the month's fixed costs. */
export const getStatusMessage = (tracker: MonthTracker) => {
  const { fixed, weekIndex, phase } = tracker
  const name = monthName(tracker.month)
  if (fixed.status === 'noFixedCosts') {
    return 'Zatím nemáš žádné fixní náklady. Přidej je v Nastavení, ať s nimi výplata počítá.'
  }
  if (fixed.status === 'covered') {
    return phase === 'past'
      ? `Fixní náklady na ${name} byly pokryté.`
      : `Fixní náklady na ${name} máš pokryté. Co přibude, jde prodavačce a na nákupy.`
  }
  if (phase === 'past') {
    return `Na fixní náklady nakonec chybělo ${formatMoney(fixed.remaining)}. Dorovnává se v dalším měsíci.`
  }
  if (phase === 'future') {
    return `Na fixní náklady bude potřeba odložit ${formatMoney(fixed.monthDue)}.`
  }
  if (fixed.status === 'onTrack') {
    return weekIndex <= 1 || fixed.covered === 0
      ? `Měsíc začíná. Tento týden odlož na fixní náklady ${formatMoney(fixed.thisWeekShare)} a budeš mít všechno včas.`
      : fixed.thisWeekShare > 0
        ? `Odkládáš včas, na konci měsíce bude na fixní náklady dost. Tento týden ještě ${formatMoney(fixed.thisWeekShare)}.`
        : 'Odkládáš včas, na konci měsíce bude na fixní náklady dost.'
  }
  return `Na fixní náklady zbývá odložit ${formatMoney(fixed.remaining)}. Rozložím to do zbývajících týdnů, to se dožene.`
}

/** Leftover / shortfall from earlier months, or null. */
export const getCarryText = (tracker: MonthTracker) =>
  tracker.fixed.carry < 0
    ? `Z minula chybělo ${formatMoney(-tracker.fixed.carry)}, už je to v plánu.`
    : tracker.fixed.carry > 0
      ? `Z minula zbylo navíc ${formatMoney(tracker.fixed.carry)}.`
      : null
