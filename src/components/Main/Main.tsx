import { cn } from '@/lib/utils'

type Props = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>
}

const Main = ({ className, ...props }: Props) => (
  <main
    className={cn(
      // Bottom padding leaves room for the floating mobile navigation.
      'mx-auto w-full max-w-6xl px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-12',
      className
    )}
    {...props}
  />
)

export default Main
