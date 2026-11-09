import { Chalkboard } from '@/components'
import { Link } from '@tanstack/react-router'

const FixedCostsBoard = () => (
  <Chalkboard title='Fixní náklady'>
    <p className='text-sm text-chalk-dim'>
      Zatím tu nic není. Nájem, elektřinu a další pravidelné platby si přidáš v nastavení a tady si
      je pak budeš odškrtávat.
    </p>
    <Link
      className='font-chalk chalk-text mt-4 inline-block rounded-full border-2 border-chalk/60 px-4 py-1 text-xl transition-colors hover:bg-chalk/10'
      to='/settings'
    >
      Přidat fixní náklady
    </Link>
  </Chalkboard>
)

export default FixedCostsBoard
