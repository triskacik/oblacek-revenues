import { EmptyState, Main, PageHeader } from '@/components'
import { CalendarCheck, House } from 'lucide-react'

const SettingsPage = () => (
  <Main>
    <PageHeader title='Nastavení' />
    <div className='grid gap-6 lg:grid-cols-2'>
      <EmptyState
        description='Nájem, elektřina, internet… Částka platí od zvoleného měsíce, takže změna nepřepíše minulost.'
        icon={House}
        title='Fixní náklady'
      />
      <EmptyState
        description='Od kdy aplikaci používáš a kolik peněz obchod v ten den měl.'
        icon={CalendarCheck}
        title='Začátek'
      />
    </div>
  </Main>
)

export default SettingsPage
