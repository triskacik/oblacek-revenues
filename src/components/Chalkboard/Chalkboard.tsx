import { cn } from '@/lib/utils'

type Props = React.ComponentProps<'section'> & {
  title?: string
}

/**
 * A shop chalkboard: dark slate in a wooden frame with white chalk lettering.
 * Use it for the things Sára should notice first (recommendation, checklists), not for everything.
 */
const Chalkboard = ({ title, className, children, ...props }: Props) => (
  <section
    className={cn(
      'chalkboard-surface rounded-2xl border-[7px] border-chalk-frame p-5 text-chalk md:p-6',
      className
    )}
    {...props}
  >
    {title ? (
      <header className='mb-3'>
        <h2 className='font-chalk chalk-text text-2xl leading-none md:text-3xl'>{title}</h2>
        <ChalkUnderline />
      </header>
    ) : null}
    {children}
  </section>
)

const ChalkUnderline = () => (
  <svg
    aria-hidden
    className='mt-1 h-2 w-28 text-chalk/70'
    fill='none'
    preserveAspectRatio='none'
    viewBox='0 0 120 8'
  >
    <path
      d='M2 5.5c14-3 30-3.5 46-2s34 2 46-.5 18-2 24-1'
      stroke='currentColor'
      strokeLinecap='round'
      strokeWidth='2.5'
    />
  </svg>
)

export default Chalkboard
