import DatePicker from '@/components/DatePicker/DatePicker'
import MoneyInput from '@/components/MoneyInput/MoneyInput'
import MonthPicker from '@/components/MonthPicker/MonthPicker'
import TimePicker from '@/components/TimePicker/TimePicker'
import { Input, Label, Textarea } from '@/components/ui'
import { cn } from '@/lib/utils'
import { Controller, useFormContext } from 'react-hook-form'
import ErrorMessage from '../ErrorMessage/ErrorMessage'
import { useFieldId } from '../contexts/FieldIdContext'

const WEEKDAYS = [
  { value: 1, label: 'Po' },
  { value: 2, label: 'Út' },
  { value: 3, label: 'St' },
  { value: 4, label: 'Čt' },
  { value: 5, label: 'Pá' },
  { value: 6, label: 'So' },
  { value: 7, label: 'Ne' },
]

type Props = {
  field: string
  label?: string
  /** Small helper text under the input. */
  hint?: React.ReactNode
  required?: boolean
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  className?: string
  /** For date / month inputs. */
  min?: string
  max?: string
  /** Keyboard hint for text inputs on phones, e.g. `numeric`. */
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  inputType: 'text' | 'textarea' | 'money' | 'date' | 'month' | 'time' | 'weekdays'
}

/**
 * Label + input + validation message bound to a react-hook-form field.
 * Values: `money` keeps the raw text (the Zod schema parses it), `weekdays` an array of ISO
 * weekdays, the rest strings (date `yyyy-MM-dd`, month `yyyy-MM`, time `HH:mm`).
 */
const HFField = ({
  field,
  label,
  hint,
  required,
  placeholder,
  disabled,
  autoFocus,
  className,
  min,
  max,
  inputMode,
  inputType,
}: Props) => {
  const { control } = useFormContext()
  const { getFieldId } = useFieldId()
  const id = getFieldId(field)

  return (
    <Controller
      control={control}
      name={field}
      render={({ field: formField, fieldState }) => {
        const common = {
          id,
          name: formField.name,
          ref: formField.ref,
          disabled,
          autoFocus,
          placeholder,
          required,
          'aria-invalid': fieldState.error ? ('true' as const) : ('false' as const),
          onBlur: formField.onBlur,
        }
        const pickerProps = {
          id,
          value: formField.value ?? '',
          onChange: formField.onChange,
          onBlur: formField.onBlur,
          disabled,
          placeholder,
          'aria-invalid': common['aria-invalid'],
        }

        return (
          <div className={cn('flex flex-col gap-1.5', className)}>
            {label ? (
              <Label className='font-semibold' htmlFor={id} required={required}>
                {label}
              </Label>
            ) : null}

            {inputType === 'textarea' ? (
              <Textarea
                {...common}
                rows={2}
                value={formField.value ?? ''}
                onChange={e => formField.onChange(e.target.value)}
              />
            ) : inputType === 'money' ? (
              <MoneyInput
                {...common}
                size='lg'
                value={formField.value ?? ''}
                onChange={e => formField.onChange(e.target.value)}
              />
            ) : inputType === 'date' ? (
              <DatePicker {...pickerProps} max={max} min={min} />
            ) : inputType === 'month' ? (
              <MonthPicker {...pickerProps} max={max} min={min} />
            ) : inputType === 'time' ? (
              <TimePicker {...pickerProps} />
            ) : inputType === 'weekdays' ? (
              <div className='flex flex-wrap gap-2' id={id} role='group'>
                {WEEKDAYS.map(day => {
                  const selected: number[] = formField.value ?? []
                  const isOn = selected.includes(day.value)
                  return (
                    <button
                      aria-pressed={isOn}
                      className={cn(
                        'size-11 rounded-full border-2 text-sm font-bold transition-colors',
                        isOn
                          ? 'border-olive bg-olive text-cream'
                          : 'border-border bg-card text-muted-foreground hover:border-olive-soft'
                      )}
                      disabled={disabled}
                      key={day.value}
                      type='button'
                      onClick={() =>
                        formField.onChange(
                          isOn
                            ? selected.filter(value => value !== day.value)
                            : [...selected, day.value].sort()
                        )
                      }
                    >
                      {day.label}
                    </button>
                  )
                })}
              </div>
            ) : (
              <Input
                {...common}
                inputMode={inputMode}
                type='text'
                value={formField.value ?? ''}
                onChange={e => formField.onChange(e.target.value)}
              />
            )}

            {fieldState.error ? (
              <ErrorMessage error={fieldState.error} />
            ) : hint ? (
              <p className='text-xs text-muted-foreground'>{hint}</p>
            ) : null}
          </div>
        )
      }}
    />
  )
}

export default HFField
