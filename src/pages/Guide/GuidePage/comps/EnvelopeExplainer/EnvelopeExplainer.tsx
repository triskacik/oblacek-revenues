import { Chalkboard } from '@/components'
import { House, ShoppingBasket } from 'lucide-react'

const ChalkLine = ({ sign, label, value }: { sign: string; label: string; value: string }) => (
  <li className='flex items-baseline justify-between gap-4'>
    <span>
      <span className='inline-block w-6 text-chalk-dim'>{sign}</span>
      {label}
    </span>
    <span className='tabular-nums'>{value}</span>
  </li>
)

/** The money model in one picture: two envelopes and the weekly calculation on a chalkboard. */
const EnvelopeExplainer = () => (
  <div className='grid gap-6 lg:grid-cols-2'>
    <div className='flex flex-col gap-4'>
      <p className='leading-relaxed'>
        Peníze obchodu si Obláček dělí do dvou <strong>obálek</strong>. Každý týden při uzávěrce do
        nich něco dáš, zbytek dostane prodavačka.
      </p>
      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='rounded-2xl border border-border bg-card p-4'>
          <span className='flex size-10 items-center justify-center rounded-full bg-honey-soft text-warning-foreground'>
            <House className='size-5' />
          </span>
          <h3 className='mt-2 font-bold'>Na fixní náklady</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Nájem, elektřina a další pravidelné platby. Přibývá při uzávěrce a ze Zásilkovny, ubývá,
            když odškrtneš zaplacený náklad. Může jít i do mínusu, když zaplatíš dřív, než se
            našetří.
          </p>
        </div>
        <div className='rounded-2xl border border-border bg-card p-4'>
          <span className='flex size-10 items-center justify-center rounded-full bg-terracotta-soft text-terracotta'>
            <ShoppingBasket className='size-5' />
          </span>
          <h3 className='mt-2 font-bold'>Na nákupy</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Peníze na zboží na další týden. Co si necháš při uzávěrce, použiješ na víkendový nákup.
            Co neutratíš, zůstane ti do dalšího týdne.
          </p>
        </div>
      </div>
      <p className='text-sm leading-relaxed text-muted-foreground'>
        Na fixní náklady ti Obláček navrhne férový díl: kolik do konce měsíce ještě chybí, rozdělené
        mezi zbývající týdny. Na nákupy navrhne průměr tvých výdajů za poslední čtyři týdny. Obojí
        můžeš přepsat.
      </p>
    </div>

    <Chalkboard title='Výplata pro prodavačku'>
      <ul className='font-chalk chalk-text space-y-1.5 text-xl md:text-2xl'>
        <ChalkLine label='zbylo na nákupy z minula' sign='' value='1 000 Kč' />
        <ChalkLine label='tržby za týden' sign='+' value='12 000 Kč' />
        <ChalkLine label='výdaje za týden' sign='-' value='4 000 Kč' />
        <li className='border-t border-chalk/25 pt-1.5'>
          <ChalkLine label='k dispozici' sign='=' value='9 000 Kč' />
        </li>
        <ChalkLine label='na fixní náklady' sign='-' value='3 000 Kč' />
        <ChalkLine label='na nákupy' sign='-' value='2 000 Kč' />
        <li className='border-t border-chalk/25 pt-1.5'>
          <ChalkLine label='prodavačce' sign='=' value='4 000 Kč' />
        </li>
      </ul>
      <p className='mt-4 text-sm text-chalk-dim'>
        Čísla jsou jen příklad. U každé částky v aplikaci najdeš „Jak se to počítá“ s tvými
        skutečnými čísly.
      </p>
    </Chalkboard>
  </div>
)

export default EnvelopeExplainer
