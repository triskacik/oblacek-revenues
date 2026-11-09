import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

/** The walking cloud from the Potraviny Obláček logo. Decorative only. */
const Mascot = ({ className }: Props) => (
  <img
    aria-hidden
    alt=''
    className={cn('pointer-events-none select-none', className)}
    src='/brand/mascot.png'
  />
)

export default Mascot
