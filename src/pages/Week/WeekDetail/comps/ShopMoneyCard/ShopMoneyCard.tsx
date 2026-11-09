import { PiggyBank } from 'lucide-react'

const ShopMoneyCard = () => (
  <section className='rounded-2xl border border-border bg-card p-5 shadow-sm shadow-olive/5'>
    <div className='mb-4 flex items-center gap-3'>
      <span className='flex size-10 items-center justify-center rounded-full bg-sage-soft text-success-foreground'>
        <PiggyBank className='size-5' />
      </span>
      <h2 className='font-chalk text-2xl leading-none text-olive'>Peníze obchodu</h2>
    </div>
    <dl className='space-y-2 text-sm'>
      <div className='flex justify-between'>
        <dt className='text-muted-foreground'>Odloženo na fixní náklady</dt>
        <dd className='font-semibold tabular-nums'>— Kč</dd>
      </div>
      <div className='flex justify-between'>
        <dt className='text-muted-foreground'>Na nákupy</dt>
        <dd className='font-semibold tabular-nums'>— Kč</dd>
      </div>
    </dl>
  </section>
)

export default ShopMoneyCard
