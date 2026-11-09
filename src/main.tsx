import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { isSupabaseConfigured } from './api/supabaseClient'
import { PageLoadError, PageNotFound, PagePending, SetupMissing } from './components'
import { Toaster } from './components/ui'
import { routeTree } from './routeTree.gen'
import './styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      staleTime: 1000 * 60, // 60 seconds
    },
  },
})

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultErrorComponent: PageLoadError,
  defaultNotFoundComponent: PageNotFound,
  defaultPendingComponent: PagePending,
  defaultPreload: 'intent',
  // Data freshness is owned by TanStack Query.
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')!
if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      {isSupabaseConfigured ? (
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster position='top-center' />
        </QueryClientProvider>
      ) : (
        <SetupMissing />
      )}
    </StrictMode>
  )
}
