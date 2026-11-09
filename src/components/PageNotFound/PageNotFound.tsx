import { Link } from '@tanstack/react-router'
import Main from '../Main/Main'
import Mascot from '../Mascot/Mascot'
import { Button } from '../ui'

const PageNotFound = () => (
  <Main className='flex flex-col items-center gap-5 text-center'>
    <Mascot className='w-32' />
    <h1 className='font-chalk text-4xl text-olive'>Tady nic není</h1>
    <p className='text-muted-foreground'>Obláček zabloudil. Vrátíme se domů?</p>
    <Button asChild className='rounded-full'>
      <Link to='/'>Domů</Link>
    </Button>
  </Main>
)

export default PageNotFound
