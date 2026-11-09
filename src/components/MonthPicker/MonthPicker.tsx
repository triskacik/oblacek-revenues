import { cn } from '@/lib/utils'
import { formatMonth } from '@/utils/weekUtils'
import { format, parse } from 'date-fns'
import { cs } from 'date-fns/locale'
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import PickerTrigger from '../PickerTrigger/PickerTrigger'
import { Button, Popover, PopoverContent, PopoverTrigger } from '../ui'

type Props = {
  id?: string
  /** `yyyy-MM` or empty. */
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  /** Earliest / latest selectable month, `yyyy-MM`. */
  min?: string
  max?: string
  placeholder?: string
  disabled?: boolean
  'aria-invalid'?: 'true' | 'false'
}

const toMonthValue = (year: number, monthIndex: number) =>
  `${year}-${String(monthIndex + 1).padStart(2, '0')}`

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

const MonthPicker = ({
  id,
  value,
  onChange,
  onBlur,
  min,
  max,
  placeholder = 'Vyber měsíc',
  disabled,
  'aria-invalid': ariaInvalid,
}: Props) => {
  const [open, setOpen] = useState(false)
  const selectedYear = value ? Number(value.slice(0, 4)) : new Date().getFullYear()
  const [year, setYear] = useState(selectedYear)

  const minYear = min ? Number(min.slice(0, 4)) : undefined
  const maxYear = max ? Number(max.slice(0, 4)) : undefined
  const label = value ? capitalize(formatMonth(parse(value, 'yyyy-MM', new Date()))) : undefined

  return (
    <Popover
      open={open}
      onOpenChange={isOpen => {
        setOpen(isOpen)
        if (isOpen) setYear(selectedYear)
        else onBlur?.()
      }}
    >
      <PopoverTrigger asChild>
        <PickerTrigger
          aria-invalid={ariaInvalid}
          disabled={disabled}
          icon={CalendarRange}
          id={id}
          label={label}
          placeholder={placeholder}
        />
      </PopoverTrigger>
      <PopoverContent align='start' className='w-64 rounded-2xl p-3'>
        <div className='mb-3 flex items-center justify-between'>
          <Button
            aria-label='Předchozí rok'
            className='size-8 rounded-full'
            disabled={minYear !== undefined && year <= minYear}
            size='icon'
            variant='ghost'
            onClick={() => setYear(year - 1)}
          >
            <ChevronLeft />
          </Button>
          <span className='font-semibold tabular-nums'>{year}</span>
          <Button
            aria-label='Další rok'
            className='size-8 rounded-full'
            disabled={maxYear !== undefined && year >= maxYear}
            size='icon'
            variant='ghost'
            onClick={() => setYear(year + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
        <div className='grid grid-cols-3 gap-1.5'>
          {Array.from({ length: 12 }, (_, monthIndex) => {
            const monthValue = toMonthValue(year, monthIndex)
            const isSelected = monthValue === value
            const isDisabled = (!!min && monthValue < min) || (!!max && monthValue > max)
            return (
              <button
                className={cn(
                  'rounded-lg py-2 text-sm capitalize transition-colors',
                  isSelected
                    ? 'bg-primary font-semibold text-primary-foreground'
                    : 'hover:bg-secondary',
                  isDisabled && 'pointer-events-none opacity-35'
                )}
                disabled={isDisabled}
                key={monthValue}
                type='button'
                onClick={() => {
                  onChange(monthValue)
                  setOpen(false)
                }}
              >
                {format(new Date(year, monthIndex, 1), 'LLL', { locale: cs })}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default MonthPicker
