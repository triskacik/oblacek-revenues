import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'

import { cn } from '@/lib/utils'

const Label = ({
  className,
  required,
  children,
  ...props
}: { required?: boolean } & React.ComponentProps<typeof LabelPrimitive.Root>) => (
  <LabelPrimitive.Root
    className={cn(
      'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
      className
    )}
    data-slot='label'
    {...props}
  >
    {required ? (
      <>
        {children}
        <span className='text-destructive -ms-1.5'>*</span>
      </>
    ) : (
      children
    )}
  </LabelPrimitive.Root>
)

export default Label
