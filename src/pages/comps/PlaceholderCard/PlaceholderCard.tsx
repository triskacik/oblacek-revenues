import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils'

type Props = {
  title: string
  description: string
  className?: string
}

/** Temporary stand-in for a section from docs/DESIGN.md that is not implemented yet. */
const PlaceholderCard = ({ title, description, className }: Props) => (
  <Card className={cn('border-dashed shadow-none', className)}>
    <CardHeader>
      <CardTitle className='text-sm font-medium text-muted-foreground'>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className='text-xs text-muted-foreground/70'>Připravujeme</CardContent>
  </Card>
)

export default PlaceholderCard
