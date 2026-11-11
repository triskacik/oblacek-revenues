import type { Expense } from '@/types'

/**
 * Notes Sára uses most for expenses ("Makro", "Pekárna"…), most frequent first, recent ones
 * winning ties. Offered as one-tap suggestions so notes stay consistent and quick to type.
 */
export const getNoteSuggestions = (expenses: Expense[], today: string, limit = 6) => {
  const since = new Date(today)
  since.setDate(since.getDate() - 90)
  const sinceDb = since.toISOString().slice(0, 10)

  const stats = new Map<string, { label: string; count: number; last: string }>()
  for (const expense of expenses) {
    const label = expense.note?.trim()
    if (!label || expense.date < sinceDb) continue
    const key = label.toLocaleLowerCase('cs')
    const current = stats.get(key)
    stats.set(key, {
      label: current && current.last > expense.date ? current.label : label,
      count: (current?.count ?? 0) + 1,
      last: current && current.last > expense.date ? current.last : expense.date,
    })
  }
  return [...stats.values()]
    .sort((a, b) => b.count - a.count || b.last.localeCompare(a.last))
    .slice(0, limit)
    .map(item => item.label)
}
