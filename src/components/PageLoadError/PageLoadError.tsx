import { Link, type ErrorComponentProps } from '@tanstack/react-router'
import { Home, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import Main from '../Main/Main'
import Mascot from '../Mascot/Mascot'
import { Button } from '../ui'

type Props = Pick<ErrorComponentProps, 'error'>

const PageLoadError = ({ error: rawError }: Props) => {
  const [showDetail, setShowDetail] = useState(false)
  // Router types thrown values as unknown; anything can be thrown.
  const error = rawError instanceof Error ? rawError : new Error(String(rawError))

  return (
    <Main className='flex flex-col items-center gap-5 text-center'>
      <Mascot className='w-32' />
      <h1 className='font-chalk text-4xl text-olive'>Něco se pokazilo</h1>
      <p className='max-w-md text-muted-foreground'>
        Stránku se nepodařilo načíst. Data jsou v bezpečí, zkus ji prosím obnovit.
      </p>
      <div className='flex flex-wrap justify-center gap-3'>
        <Button className='rounded-full' onClick={() => window.location.reload()}>
          <RefreshCw /> Obnovit
        </Button>
        <Button asChild className='rounded-full' variant='outline'>
          <Link to='/'>
            <Home /> Domů
          </Link>
        </Button>
      </div>
      {showDetail ? (
        <pre className='max-w-full overflow-auto rounded-xl bg-secondary p-4 text-left text-xs whitespace-pre-wrap'>
          {error.message}
          {error.stack ? `\n\n${error.stack}` : null}
        </pre>
      ) : (
        <button
          className='text-xs text-muted-foreground underline underline-offset-4'
          type='button'
          onClick={() => setShowDetail(true)}
        >
          Technické detaily
        </button>
      )}
    </Main>
  )
}

export default PageLoadError
