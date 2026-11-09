import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

const Checkbox = ({
  className,
  disabled,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Radix only toggles on Space (WAI-ARIA). Also toggle on Enter so keyboard
    // users get the same activation as a focused button, without submitting the form.
    if (event.key === 'Enter' && !disabled) {
      event.preventDefault()
      event.currentTarget.click()
    }
    onKeyDown?.(event)
  }

  return (
    <CheckboxPrimitive.Root
      className={cn(
        'peer border-input cursor-pointer dark:bg-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-lg border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      data-slot='checkbox'
      disabled={disabled}
      {...props}
      onKeyDown={handleKeyDown}
    >
      <CheckboxPrimitive.Indicator
        className='grid place-content-center text-current transition-none'
        data-slot='checkbox-indicator'
      >
        <CheckIcon className='size-3.5' />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
