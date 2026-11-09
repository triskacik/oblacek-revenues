import { Button } from '@/components/ui'
import { signInWithGoogle } from '@/auth/session'
import { toast } from '@/lib/toast'

const GoogleIcon = () => (
  <svg aria-hidden className='size-5' viewBox='0 0 24 24'>
    <path
      d='M21.6 12.23c0-.68-.06-1.36-.18-2.02H12v3.83h5.4a4.6 4.6 0 0 1-2 3.03v2.5h3.23c1.9-1.74 2.97-4.3 2.97-7.34Z'
      fill='#4285F4'
    />
    <path
      d='M12 22c2.7 0 4.97-.9 6.63-2.43l-3.23-2.5c-.9.6-2.04.96-3.4.96-2.6 0-4.82-1.76-5.6-4.13H3.06v2.58A10 10 0 0 0 12 22Z'
      fill='#34A853'
    />
    <path d='M6.4 13.9a6 6 0 0 1 0-3.8V7.52H3.06a10 10 0 0 0 0 8.96L6.4 13.9Z' fill='#FBBC05' />
    <path
      d='M12 5.97c1.47 0 2.8.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.52L6.4 10.1C7.18 7.73 9.4 5.97 12 5.97Z'
      fill='#EA4335'
    />
  </svg>
)

const Login = () => {
  const onSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch {
      toast.error('Přihlášení se nepovedlo, zkus to prosím znovu.')
    }
  }

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-10 p-6'>
      <img alt='Potraviny Obláček' className='w-full max-w-md' src='/brand/logo.png' />
      <div className='flex w-full max-w-sm flex-col items-center gap-5 text-center'>
        <p className='font-chalk text-3xl leading-tight text-olive'>
          Ahoj! Mrkneme, jak se obchodu daří?
        </p>
        <Button
          className='h-12 w-full rounded-full bg-card text-base font-semibold text-foreground shadow-sm hover:bg-secondary'
          variant='outline'
          onClick={onSignIn}
        >
          <GoogleIcon />
          Přihlásit přes Google
        </Button>
      </div>
    </div>
  )
}

export default Login
