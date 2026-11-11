import { useSaveSale } from '@/api/sales'
import { Spinner } from '@/components/ui'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { parseMoney } from '@/utils/moneyUtils'
import { Check } from 'lucide-react'
import { useState } from 'react'

type Props = {
  /** `yyyy-MM-dd` */
  date: string
}

/**
 * Today's sale straight in the day row: type the amount, press Enter. The most frequent action
 * in the app, so it skips the dialog. The full dialog is still there for notes or corrections.
 */
const QuickSaleInput = ({ date }: Props) => {
  const [value, setValue] = useState('')
  const save = useSaveSale()
  const parsed = parseMoney(value)
  const isValid = parsed !== null && !Number.isNaN(parsed) && parsed >= 0

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) {
      if (value.trim()) toast.error('Tohle není částka, zkus třeba 12500 nebo 12500,50')
      return
    }
    try {
      await save.mutateAsync({ date, amount: parsed, note: null })
      toast.success(parsed === 0 ? 'Zapsáno, dnes zavřeno' : 'Dnešní tržba uložena')
      setValue('')
    } catch {
      toast.error('Uložit se nepovedlo, zkus to prosím znovu.')
    }
  }

  return (
    <form className='flex items-center gap-1.5' onSubmit={onSubmit}>
      <span className='relative'>
        <input
          aria-label='Dnešní tržba'
          className='h-8 w-36 rounded-full border border-terracotta/40 bg-card pr-9 pl-3 text-right text-sm font-semibold tabular-nums outline-none placeholder:font-normal placeholder:text-muted-foreground focus:border-terracotta focus:ring-[3px] focus:ring-terracotta/15'
          disabled={save.isPending}
          enterKeyHint='done'
          inputMode='decimal'
          placeholder='Tržba dnes'
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <span className='pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground'>
          Kč
        </span>
      </span>
      <button
        aria-label='Uložit dnešní tržbu'
        className={cn(
          'flex size-8 items-center justify-center rounded-full transition-colors',
          isValid
            ? 'bg-terracotta text-cream hover:bg-terracotta/90'
            : 'bg-secondary text-muted-foreground'
        )}
        disabled={save.isPending}
        type='submit'
      >
        {save.isPending ? <Spinner className='size-4' /> : <Check className='size-4' />}
      </button>
    </form>
  )
}

export default QuickSaleInput
