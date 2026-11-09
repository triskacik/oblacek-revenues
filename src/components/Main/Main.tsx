import { cn } from '@/lib/utils'

type Props = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  fluid?: boolean
  ref?: React.Ref<HTMLElement>
}

const Main = ({ fixed, className, fluid, ...props }: Props) => (
  <main
    className={cn(
      // Bottom padding leaves room for the mobile bottom navigation.
      'h-full w-full px-4 md:px-6 pt-4 pb-24 md:pb-6',
      fixed && 'flex grow flex-col overflow-hidden',
      !fluid && '@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl',
      className
    )}
    data-layout={fixed ? 'fixed' : 'auto'}
    {...props}
  />
)

export default Main
