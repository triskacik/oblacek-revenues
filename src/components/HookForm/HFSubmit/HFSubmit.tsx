import { Button, Spinner } from '@/components/ui'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { useFormContext, useFormState } from 'react-hook-form'

type Props = {
  children?: React.ReactNode
  className?: string
  /** Pending state of the mutation; the form's own submitting state is included automatically. */
  isPending?: boolean
}

const HFSubmit = ({ children = 'Uložit', className, isPending }: Props) => {
  const { control } = useFormContext()
  const { isSubmitting } = useFormState({ control })
  const busy = isPending || isSubmitting

  return (
    <Button className={cn('rounded-full px-6', className)} disabled={busy} size='lg' type='submit'>
      {busy ? <Spinner /> : <Check />}
      {children}
    </Button>
  )
}

export default HFSubmit
