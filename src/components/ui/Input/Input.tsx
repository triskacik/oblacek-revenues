import * as React from 'react'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const Input = forwardRef<
  HTMLInputElement,
  { size?: 'sm' | 'lg'; align?: 'start' | 'end' } & Omit<React.ComponentProps<'input'>, 'size'>
>(({ className, type, size, align = 'start', readOnly, ...props }, ref) => (
  <input
    className={cn(
      'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input border-input h-9 w-full min-w-0 rounded-md border bg-background px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 md:text-sm data-[size=lg]:px-4 data-[size=lg]:py-2 data-[size=lg]:h-11 data-[size=lg]:text-lg data-[size=sm]:px-2 data-[size=sm]:py-0 data-[size=sm]:h-7 data-[size=sm]:text-sm',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      'data-[api-updated=true]:ring-success/20 dark:data-[api-updated=true]:ring-success/40 data-[api-updated=true]:border-(--color-api-updated) data-[api-updated=true]:shadow-api-updated',
      'data-readonly:cursor-not-allowed',
      { 'text-end': align === 'end' },
      {
        'flex justify-end items-center':
          align === 'end' && ['date', 'datetime-local'].includes(type ?? ''),
      },
      className
    )}
    data-readonly={readOnly ? 'true' : undefined}
    data-size={size}
    data-slot='input'
    readOnly={readOnly}
    ref={ref}
    type={type}
    {...props}
  />
))
export { Input }
