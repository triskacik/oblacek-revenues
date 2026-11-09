type Props = {
  number: number
  title: string
  /** When to do it, e.g. "Každý den po zavření". */
  when: string
  /** Why it matters, shown as a small note. */
  why?: string
  children: React.ReactNode
}

/** One habit in Sára's week: chalk number, what to do and why. */
const StepCard = ({ number, title, when, why, children }: Props) => (
  <li className='relative flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-olive/5'>
    <span className='chalkboard-surface font-chalk chalk-text flex size-11 shrink-0 items-center justify-center rounded-full text-2xl'>
      {number}
    </span>
    <div className='min-w-0'>
      <p className='text-xs font-bold tracking-wide text-terracotta uppercase'>{when}</p>
      <h3 className='mt-0.5 text-lg font-bold'>{title}</h3>
      <div className='mt-1.5 space-y-2 text-sm leading-relaxed text-foreground/90'>{children}</div>
      {why ? (
        <p className='mt-3 rounded-xl bg-sage-soft/70 px-3 py-2 text-xs text-success-foreground'>
          <span className='font-bold'>Proč: </span>
          {why}
        </p>
      ) : null}
    </div>
  </li>
)

export default StepCard
