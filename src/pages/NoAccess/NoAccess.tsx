import { Mascot } from '@/components'
import { Button } from '@/components/ui'
import { signOut } from '@/auth/session'
import useSessionUser from '@/hooks/useSessionUser'
import { useNavigate } from '@tanstack/react-router'

const NoAccess = () => {
  const user = useSessionUser()
  const navigate = useNavigate()

  const onSignOut = async () => {
    await signOut()
    navigate({ to: '/login' })
  }

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center'>
      <Mascot className='w-32 grayscale-[40%]' />
      <h1 className='font-chalk text-4xl text-olive'>Sem bohužel nemůžeš</h1>
      <p className='max-w-sm text-muted-foreground'>
        Účet {user?.email ? <strong className='text-foreground'>{user.email}</strong> : null} do
        aplikace nemá přístup.
      </p>
      <Button className='rounded-full' variant='outline' onClick={onSignOut}>
        Přihlásit jiným účtem
      </Button>
    </div>
  )
}

export default NoAccess
