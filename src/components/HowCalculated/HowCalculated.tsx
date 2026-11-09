import { cn } from '@/lib/utils'
import { formatMoney } from '@/utils/moneyUtils'
import { Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui'

export type CalculationRow =
  | { kind: 'plus' | 'minus' | 'total'; label: string; amount: number; note?: string }
  | { kind: 'note'; label: string }

type Props = {
  rows: CalculationRow[]
  /** `chalk` for use on a Chalkboard. */
  variant?: 'default' | 'chalk'
  className?: string
}

const signs = { plus: '+', minus: '-', total: '=' } as const

/** "Jak se to počítá": a computed number explained in a few plain lines. */
const HowCalculated = ({ rows, variant = 'default', className }: Props) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        className={cn(
          'inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline',
          variant === 'chalk' ? 'text-chalk-dim hover:text-chalk' : 'text-muted-foreground',
          className
        )}
        type='button'
      >
        <Info className='size-4' />
        Jak se to počítá
      </button>
    </PopoverTrigger>
    <PopoverContent align='start' className='w-80 rounded-2xl p-4'>
      <ul className='flex flex-col gap-1.5 text-sm'>
        {rows.map((row, index) =>
          row.kind === 'note' ? (
            <li className='pt-1 text-xs text-muted-foreground' key={index}>
              {row.label}
            </li>
          ) : (
            <li
              className={cn(
                'flex items-baseline justify-between gap-3',
                row.kind === 'total' && 'border-t border-border pt-1.5 font-bold'
              )}
              key={index}
            >
              <span>
                <span className='inline-block w-4 text-muted-foreground'>{signs[row.kind]}</span>
                {row.label}
                {row.note ? (
                  <span className='block pl-4 text-xs font-normal text-muted-foreground'>
                    {row.note}
                  </span>
                ) : null}
              </span>
              <span className='shrink-0 tabular-nums'>{formatMoney(row.amount)}</span>
            </li>
          )
        )}
      </ul>
    </PopoverContent>
  </Popover>
)

export default HowCalculated
