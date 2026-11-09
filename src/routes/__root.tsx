import { PageLoadError, PageNotFound } from '@/components'
import type { RouterContext } from '@/lib/router'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const RootComponent = () => (
  <>
    <Outlet />
    {import.meta.env.DEV ? <TanStackRouterDevtools position='bottom-right' /> : null}
  </>
)

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: PageLoadError,
  notFoundComponent: PageNotFound,
})
