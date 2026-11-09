import { EmptyState } from '@/components'
import { Leaf } from 'lucide-react'

const NoticesCard = () => (
  <EmptyState
    description='Až bude potřeba něco udělat, třeba uzavřít týden nebo zaplatit nájem, připomenu ti to tady.'
    icon={Leaf}
    title='Zatím v klidu'
  />
)

export default NoticesCard
