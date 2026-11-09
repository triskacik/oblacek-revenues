import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { signInWithGoogle } from '@/auth/session'
import { toast } from '@/lib/toast'
import { Cloud } from 'lucide-react'

const Login = () => {
  const onSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch {
      toast.error('Přihlášení se nepovedlo', { description: 'Zkuste to prosím znovu.' })
    }
  }

  return (
    <div className='flex min-h-svh items-center justify-center bg-muted/40 p-4'>
      <Card className='w-full max-w-sm'>
        <CardHeader className='items-center text-center'>
          <div className='mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground'>
            <Cloud className='size-6' />
          </div>
          <CardTitle className='text-xl'>Obláček</CardTitle>
          <CardDescription>Přehled tržeb a výdajů obchodu</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className='w-full' size='lg' onClick={onSignIn}>
            Přihlásit přes Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
