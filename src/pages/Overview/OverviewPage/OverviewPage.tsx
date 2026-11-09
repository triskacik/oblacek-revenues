import { Main, PageHeader } from '@/components'
import { PlaceholderCard } from '@/pages/comps'

const OverviewPage = () => (
  <>
    <PageHeader title='Přehled' />
    <Main>
      <div className='grid gap-4 lg:grid-cols-2'>
        <PlaceholderCard
          className='lg:col-span-2'
          description='Tržby, výdaje a výsledek za posledních 12 měsíců.'
          title='Vývoj po měsících'
        />
        <PlaceholderCard
          description='Odloženo na fixní náklady a na nákupy v čase.'
          title='Peníze obchodu'
        />
        <PlaceholderCard
          description='Vyplaceno prodavačce, fixní náklady, průměrná tržba.'
          title='Součty'
        />
      </div>
    </Main>
  </>
)

export default OverviewPage
