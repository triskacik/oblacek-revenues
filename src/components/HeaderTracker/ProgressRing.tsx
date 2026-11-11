import { cn } from '@/lib/utils'
import { Check, Minus } from 'lucide-react'

type Props = {
  /** 0..1 */
  value: number
  tone: 'sage' | 'honey' | 'muted'
  size?: number
  className?: string
}

const toneStroke = {
  sage: 'var(--sage)',
  honey: 'var(--honey)',
  muted: 'var(--muted-foreground)',
} as const

/**
 * Small ring: the arc shows how much is put aside, the centre says whether it's fine
 * (tick), needs catching up (!) or there's nothing to track (dash).
 */
const ProgressRing = ({ value, tone, size = 38, className }: Props) => {
  const stroke = 4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(1, Math.max(0, value))

  return (
    <span
      className={cn('relative inline-flex shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <svg aria-hidden className='-rotate-90' height={size} width={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          fill='none'
          r={radius}
          stroke='var(--secondary)'
          strokeWidth={stroke}
        />
        <circle
          className='transition-[stroke-dashoffset] duration-700 ease-out'
          cx={size / 2}
          cy={size / 2}
          fill='none'
          r={radius}
          stroke={toneStroke[tone]}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          strokeLinecap='round'
          strokeWidth={stroke}
        />
      </svg>
      <span className='absolute inset-0 flex items-center justify-center'>
        {tone === 'sage' ? (
          <Check className='size-4 text-success-foreground' strokeWidth={3} />
        ) : tone === 'honey' ? (
          <span className='text-base leading-none font-black text-warning-foreground'>!</span>
        ) : (
          <Minus className='size-4 text-muted-foreground' />
        )}
      </span>
    </span>
  )
}

export default ProgressRing
