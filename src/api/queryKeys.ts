/**
 * The only place where query keys are spelled out (enforced by `oblacek/no-hardcoded-query-key`).
 * Invalidate with the `all` key of a table after any write to it.
 */
export const queryKeys = {
  access: {
    all: ['access'] as const,
    byUser: (userId: string) => ['access', userId] as const,
  },
  settings: {
    all: ['settings'] as const,
  },
  fixedCosts: {
    all: ['fixedCosts'] as const,
  },
  expenses: {
    all: ['expenses'] as const,
  },
  sales: {
    all: ['sales'] as const,
  },
  otherIncomes: {
    all: ['otherIncomes'] as const,
  },
  weekClosings: {
    all: ['weekClosings'] as const,
  },
  fixedCostPayments: {
    all: ['fixedCostPayments'] as const,
  },
  dismissedAlerts: {
    all: ['dismissedAlerts'] as const,
  },
  pushDevice: {
    current: ['pushDevice'] as const,
  },
}
