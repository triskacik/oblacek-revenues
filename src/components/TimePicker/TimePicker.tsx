import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'
import { useState } from 'react'
import PickerTrigger from '../PickerTrigger/PickerTrigger'
import { Popover, PopoverContent, PopoverTrigger } from '../ui'

type Props = {
  id?: string
  /** `HH:mm` or empty. */
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  'aria-invalid'?: 'true' | 'false'
}

const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'))
const MINUTES = ['00', '15', '30', '45']

/** Hour grid + quarter-hour minutes; enough for a shop's closing time. */
const TimePicker = ({
  id,
  value,
  onChange,
  onBlur,
  placeholder = 'Vyber čas',
  disabled,
  'aria-invalid': ariaInvalid,
}: Props) => {
  const [open, setOpen] = useState(false)
  const [hour = '18', minute = '00'] = value ? value.split(':') : []

  const cellClass = (isSelected: boolean) =>
    cn(
      'rounded-lg py-1.5 text-sm tabular-nums transition-colors',
      isSelected ? 'bg-primary font-semibold text-primary-foreground' : 'hover:bg-secondary'
    )

  return (
    <Popover
      open={open}
      onOpenChange={isOpen => {
        setOpen(isOpen)
        if (!isOpen) onBlur?.()
      }}
    >
      <PopoverTrigger asChild>
        <PickerTrigger
          aria-invalid={ariaInvalid}
          disabled={disabled}
          icon={Clock}
          id={id}
          label={value || undefined}
          placeholder={placeholder}
        />
      </PopoverTrigger>
      <PopoverContent align='start' className='w-72 rounded-2xl p-3'>
        <div className='mb-1.5 text-xs font-semibold text-muted-foreground'>Hodina</div>
        <div className='grid grid-cols-6 gap-1'>
          {HOURS.map(h => (
            <button
              className={cellClass(value !== '' && h === hour)}
              key={h}
              type='button'
              onClick={() => onChange(`${h}:${minute}`)}
            >
              {h}
            </button>
          ))}
        </div>
        <div className='mt-3 mb-1.5 text-xs font-semibold text-muted-foreground'>Minuty</div>
        <div className='grid grid-cols-4 gap-1'>
          {MINUTES.map(m => (
            <button
              className={cellClass(value !== '' && m === minute)}
              key={m}
              type='button'
              onClick={() => {
                onChange(`${hour}:${m}`)
                setOpen(false)
              }}
            >
              :{m}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default TimePicker
