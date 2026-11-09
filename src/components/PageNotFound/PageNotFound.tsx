import { Link } from '@tanstack/react-router'
import { Home, SearchX } from 'lucide-react'
import Main from '../Main/Main'
import { Alert, AlertDescription, AlertTitle, Button } from '../ui'

const PageNotFound = () => (
  <Main>
    <Alert>
      <SearchX />
      <AlertTitle>Stránka neexistuje</AlertTitle>
      <AlertDescription>
        <p>Tahle adresa v aplikaci není.</p>
        <div className='mt-6'>
          <Button asChild variant='outline'>
            <Link to='/'>
              <Home /> Domů
            </Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  </Main>
)

export default PageNotFound
