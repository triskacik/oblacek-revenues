import { formatDate, parseDbDate, toDbDate } from '@/utils/dateUtils'
import { subDays } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { useState } from 'react'
import { cs } from 'react-day-picker/locale'
import PickerTrigger from '../PickerTrigger/PickerTrigger'
import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from '../ui'

type Props = {
  id?: string
  /** `yyyy-MM-dd` or empty. */
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  /** Earliest / latest selectable day, `yyyy-MM-dd`. */
  min?: string
  max?: string
  placeholder?: string
  disabled?: boolean
  'aria-invalid'?: 'true' | 'false'
}

const DatePicker = ({
  id,
  value,
  onChange,
  onBlur,
  min,
  max,
  placeholder = 'Vyber den',
  disabled,
  'aria-invalid': ariaInvalid,
}: Props) => {
  const [open, setOpen] = useState(false)
  const selected = value ? parseDbDate(value) : undefined
  const minDate = min ? parseDbDate(min) : undefined
  const maxDate = max ? parseDbDate(max) : undefined

  const pick = (date: Date) => {
    onChange(toDbDate(date))
    setOpen(false)
  }

  const isAllowed = (date: string) => (!min || date >= min) && (!max || date <= max)
  const today = toDbDate(new Date())
  const yesterday = toDbDate(subDays(new Date(), 1))

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
          icon={CalendarDays}
          id={id}
          label={value ? formatDate(value) : undefined}
          placeholder={placeholder}
        />
      </PopoverTrigger>
      <PopoverContent align='start' className='w-auto rounded-2xl p-0'>
        <Calendar
          autoFocus
          className='rounded-2xl'
          defaultMonth={selected ?? maxDate}
          disabled={[
            ...(minDate ? [{ before: minDate }] : []),
            ...(maxDate ? [{ after: maxDate }] : []),
          ]}
          locale={cs}
          mode='single'
          selected={selected}
          weekStartsOn={1}
          onSelect={date => date && pick(date)}
        />
        <div className='flex gap-2 border-t border-border px-3 py-2.5'>
          {isAllowed(today) ? (
            <Button
              className='h-7 rounded-full text-xs'
              size='sm'
              variant='secondary'
              onClick={() => pick(new Date())}
            >
              Dnes
            </Button>
          ) : null}
          {isAllowed(yesterday) ? (
            <Button
              className='h-7 rounded-full text-xs'
              size='sm'
              variant='secondary'
              onClick={() => pick(subDays(new Date(), 1))}
            >
              Včera
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker
