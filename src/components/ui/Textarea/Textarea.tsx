import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = ({ className, readOnly, ...props }: React.ComponentProps<'textarea'>) => (
  <textarea
    className={cn(
      'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input flex field-sizing-content min-h-16 w-full rounded-md border bg-background px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'data-[api-updated=true]:ring-success/20 dark:data-[api-updated=true]:ring-success/40 data-[api-updated=true]:border-(--color-api-updated) data-[api-updated=true]:shadow-api-updated',
      'data-readonly:cursor-not-allowed',
      className
    )}
    data-readonly={readOnly ? 'true' : undefined}
    data-slot='textarea'
    readOnly={readOnly}
    {...props}
  />
)

export { Textarea }
