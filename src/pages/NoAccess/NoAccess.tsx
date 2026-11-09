import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { signOut } from '@/auth/session'
import useSessionUser from '@/hooks/useSessionUser'
import { useNavigate } from '@tanstack/react-router'
import { ShieldX } from 'lucide-react'

const NoAccess = () => {
  const user = useSessionUser()
  const navigate = useNavigate()

  const onSignOut = async () => {
    await signOut()
    navigate({ to: '/login' })
  }

  return (
    <div className='flex min-h-svh items-center justify-center bg-muted/40 p-4'>
      <Card className='w-full max-w-sm'>
        <CardHeader className='items-center text-center'>
          <div className='mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive'>
            <ShieldX className='size-6' />
          </div>
          <CardTitle className='text-xl'>Nemáte přístup</CardTitle>
          <CardDescription>
            Účet {user?.email ? <strong>{user.email}</strong> : null} nemá do aplikace přístup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className='w-full' variant='outline' onClick={onSignOut}>
            Přihlásit jiným účtem
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default NoAccess
