import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { AuthProvider } from '../contexts/AuthContext'
import { Toaster } from 'sonner'

import Header from '../components/Header'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <div
        className="fixed inset-0 -z-10 pointer-events-none flex items-center justify-center opacity-10 bg-no-repeat bg-center"
        style={{
          backgroundImage: "url('/mascot-flag.webp')",
          backgroundSize: "700px", // Making it small
        }}
      />
      <AuthProvider>
        <Header />
        <Outlet />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </>
  ),
})
