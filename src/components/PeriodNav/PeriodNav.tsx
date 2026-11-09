import { Link, type LinkOptions } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Undo2 } from 'lucide-react'
import { Button } from '../ui'

type Props = {
  prev: LinkOptions
  next: LinkOptions
  prevLabel: string
  nextLabel: string
  /** Link back to the current period; omit when already there. */
  current?: LinkOptions
  currentLabel?: string
}

const PeriodNav = ({ prev, next, prevLabel, nextLabel, current, currentLabel }: Props) => (
  <div className='flex items-center gap-1.5'>
    <Button asChild className='rounded-full' size='icon' variant='outline'>
      <Link {...prev} aria-label={prevLabel}>
        <ChevronLeft />
      </Link>
    </Button>
    <Button asChild className='rounded-full' size='icon' variant='outline'>
      <Link {...next} aria-label={nextLabel}>
        <ChevronRight />
      </Link>
    </Button>
    {current ? (
      // The icon and "Skočit na…" wording make it read as an action, not a "this week" badge.
      <Button asChild className='ml-1 rounded-full' size='sm' variant='secondary'>
        <Link {...current}>
          <Undo2 />
          {currentLabel}
        </Link>
      </Button>
    ) : null}
  </div>
)

export default PeriodNav
