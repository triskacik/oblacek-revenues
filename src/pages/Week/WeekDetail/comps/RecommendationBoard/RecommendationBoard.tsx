import { Chalkboard, Mascot } from '@/components'

const RecommendationBoard = () => (
  <div className='relative pt-14 md:pt-16'>
    {/* The cloud from the logo walks along the top of the board. */}
    <Mascot className='absolute top-0 right-6 w-20 md:right-10 md:w-24' />
    <Chalkboard title='Prodavačce tento týden'>
      <p className='font-chalk chalk-text text-6xl leading-tight md:text-7xl'>— Kč</p>
      <p className='mt-3 max-w-md text-sm text-chalk-dim md:text-base'>
        Jakmile zapíšeš tržby a výdaje, napíšu ti sem, kolik můžeš dát prodavačce, aby zbylo na
        nákupy i na nájem.
      </p>
    </Chalkboard>
  </div>
)

export default RecommendationBoard
