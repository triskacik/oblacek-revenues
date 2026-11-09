import useTheme from '@/hooks/useTheme'
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      className='toaster group z-[2147483647]'
      icons={{
        success: <CircleCheckIcon className='size-4 text-success-foreground' />,
        info: <InfoIcon className='size-4 text-blue-500' />,
        warning: <TriangleAlertIcon className='size-4 text-warning-foreground' />,
        error: <OctagonXIcon className='size-4 text-destructive-foreground' />,
        loading: <Loader2Icon className='size-4 animate-spin text-muted-foreground' />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
          zIndex: 2147483647,
        } as React.CSSProperties
      }
      theme={resolvedTheme}
      {...props}
    />
  )
}

export { Toaster }
