import type { LucideIcon } from 'lucide-react'

type Props = {
  id: string
  title: string
  intro?: string
  icon: LucideIcon
  children: React.ReactNode
}

const GuideSection = ({ id, title, intro, icon: Icon, children }: Props) => (
  <section className='scroll-mt-28' id={id}>
    <header className='mb-4 flex items-start gap-3'>
      <span className='flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-olive-soft'>
        <Icon className='size-5' />
      </span>
      <div>
        <h2 className='font-chalk text-3xl leading-none text-olive'>{title}</h2>
        {intro ? <p className='mt-1.5 max-w-2xl text-muted-foreground'>{intro}</p> : null}
      </div>
    </header>
    {children}
  </section>
)

export default GuideSection
