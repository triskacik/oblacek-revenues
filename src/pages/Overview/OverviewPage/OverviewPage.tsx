import { EmptyState, Main, Mascot, PageHeader } from '@/components'
import { ChartSpline, PiggyBank, Trophy } from 'lucide-react'

const OverviewPage = () => (
  <Main>
    <PageHeader subtitle='Jak se obchodu daří v delším čase' title='Přehled' />
    <div className='grid gap-6 lg:grid-cols-2'>
      <EmptyState
        className='min-h-64 lg:col-span-2'
        description='Tržby, výdaje a výsledek za posledních 12 měsíců.'
        icon={ChartSpline}
        title='Měsíc po měsíci'
      >
        <Mascot className='mx-auto mt-auto w-28 opacity-80' />
      </EmptyState>
      <EmptyState
        description='Kolik bylo odloženo na fixní náklady a na nákupy v čase.'
        icon={PiggyBank}
        title='Peníze obchodu'
      />
      <EmptyState
        description='Vyplaceno prodavačce, zaplacené fixní náklady, průměrná tržba.'
        icon={Trophy}
        title='Od začátku'
      />
    </div>
  </Main>
)

export default OverviewPage
