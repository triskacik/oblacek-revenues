/**
 * The only place where query keys are spelled out (enforced by `oblacek/no-hardcoded-query-key`).
 * Add a branch per table when its queries are implemented.
 */
export const queryKeys = {
  access: {
    all: ['access'] as const,
    byUser: (userId: string) => ['access', userId] as const,
  },
}
