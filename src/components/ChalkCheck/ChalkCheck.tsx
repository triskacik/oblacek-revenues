import { cn } from '@/lib/utils'

type Props = {
  checked: boolean
  className?: string
}

/** A box drawn in chalk, ticked when done. For checklists on a Chalkboard. */
const ChalkCheck = ({ checked, className }: Props) => (
  <svg
    aria-hidden
    className={cn('size-6 shrink-0 text-chalk', className)}
    fill='none'
    viewBox='0 0 24 24'
  >
    <path
      d='M4.5 4.8c5-.6 10-.5 15 .1.4 4.7.3 9.4-.1 14.2-5 .4-10 .5-14.8 0-.5-4.8-.5-9.5-.1-14.3Z'
      opacity='.75'
      stroke='currentColor'
      strokeLinecap='round'
      strokeWidth='1.8'
    />
    {checked ? (
      <path
        d='M7.5 12.5c1.2 1 2.2 2.2 3.1 3.6 2-3.6 4.3-6.6 7-9'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth='2.4'
      />
    ) : null}
  </svg>
)

export default ChalkCheck
