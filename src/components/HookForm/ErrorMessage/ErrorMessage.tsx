import { cn } from '@/lib/utils'
import type { FieldError } from 'react-hook-form'

type Props = {
  error: FieldError
} & React.ComponentProps<'div'>

const ErrorMessage = ({ error, className, ...rest }: Props) => (
  <div className={cn('text-xs font-semibold text-accent-foreground', className)} {...rest}>
    {error.message}
  </div>
)

export default ErrorMessage
