import { Button, Spinner } from '@/components/ui'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

type Props = {
  onConfirm: () => void
  isPending?: boolean
  label?: string
  question?: string
}

/** Two-step delete: the first click asks, the second deletes. */
const DeleteButton = ({
  onConfirm,
  isPending,
  label = 'Smazat',
  question = 'Opravdu smazat?',
}: Props) => {
  const [asking, setAsking] = useState(false)

  if (!asking) {
    return (
      <Button
        className='rounded-full text-muted-foreground'
        type='button'
        variant='ghost'
        onClick={() => setAsking(true)}
      >
        <Trash2 /> {label}
      </Button>
    )
  }

  return (
    <div className='flex items-center gap-2'>
      <span className='text-sm text-muted-foreground'>{question}</span>
      <Button
        className='rounded-full'
        disabled={isPending}
        size='sm'
        type='button'
        variant='outline'
        onClick={onConfirm}
      >
        {isPending ? <Spinner /> : <Trash2 />} Ano
      </Button>
      <Button size='sm' type='button' variant='ghost' onClick={() => setAsking(false)}>
        Ne
      </Button>
    </div>
  )
}

export default DeleteButton
