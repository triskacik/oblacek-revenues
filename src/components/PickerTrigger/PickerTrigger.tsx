import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type Props = Omit<React.ComponentProps<'button'>, 'children'> & {
  icon: LucideIcon
  /** Formatted value; when empty the placeholder is shown. */
  label?: string
  placeholder?: string
}

/** Button that looks like an input field; opens a picker popover. */
const PickerTrigger = ({ icon: Icon, label, placeholder, className, ...props }: Props) => (
  <button
    className={cn(
      'flex h-11 w-full items-center gap-2.5 rounded-md border border-input bg-background px-3 text-left text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
      'hover:border-olive-soft/60 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
      'aria-invalid:border-destructive data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/50',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    type='button'
    {...props}
  >
    <Icon className='size-4 shrink-0 text-olive-soft' />
    <span className={cn('flex-1 truncate', !label && 'text-muted-foreground')}>
      {label || placeholder}
    </span>
  </button>
)

export default PickerTrigger
