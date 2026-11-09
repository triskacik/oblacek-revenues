import { Link, type ErrorComponentProps } from '@tanstack/react-router'
import { AlertCircleIcon, ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import Main from '../Main/Main'
import { Alert, AlertDescription, AlertTitle, Button } from '../ui'

type Props = Pick<ErrorComponentProps, 'error'>

const PageLoadError = ({ error: rawError }: Props) => {
  const [showDetail, setShowDetail] = useState(false)
  // Router types thrown values as unknown; anything can be thrown.
  const error = rawError instanceof Error ? rawError : new Error(String(rawError))

  return (
    <Main>
      <Alert variant='destructive'>
        <AlertCircleIcon />
        <AlertTitle>Nepovedlo se načíst stránku.</AlertTitle>
        <AlertDescription>
          Obnovte stránku, nebo to zkuste později.
          <ul className='mt-5 list-inside list-disc space-y-2 text-sm'>
            {error.message ? (
              <li>
                <span className='me-1 font-semibold'>Chyba:</span>
                {error.message}
              </li>
            ) : null}
            {error.stack ? (
              <li>
                {showDetail ? (
                  <span className='whitespace-pre-wrap'>{error.stack}</span>
                ) : (
                  <Button size='sm' variant='outline' onClick={() => setShowDetail(true)}>
                    Zobrazit detail
                  </Button>
                )}
              </li>
            ) : null}
          </ul>
          <div className='mt-8 flex flex-wrap items-center gap-3'>
            <Button variant='outline' onClick={() => window.location.reload()}>
              <RefreshCw /> Obnovit stránku
            </Button>
            <Button variant='outline' onClick={() => window.history.back()}>
              <ArrowLeft /> Zpět
            </Button>
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
}

export default PageLoadError
