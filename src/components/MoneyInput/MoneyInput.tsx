import { cn } from '@/lib/utils'
import { Input } from '../ui'

type Props = Omit<React.ComponentProps<typeof Input>, 'type' | 'inputMode'>

/** Text input with a `Kč` suffix and a decimal keyboard on phones. Parsing lives in moneyUtils. */
const MoneyInput = ({ className, ...props }: Props) => (
  <div className='relative'>
    <Input
      autoComplete='off'
      className={cn('pr-11 text-right tabular-nums data-[size=lg]:pr-11', className)}
      inputMode='decimal'
      type='text'
      {...props}
    />
    <span className='pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground'>
      Kč
    </span>
  </div>
)

export default MoneyInput
