import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { AuthProvider } from '../contexts/AuthContext'
import { Toaster } from 'sonner'

import Header from '../components/Header'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

import { ThemeProvider } from '../components/theme-provider'

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      {/* Premium Background Gradients */}
      <div className="fixed inset-0 -z-20 h-full w-full bg-background transition-colors duration-300">
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.03] dark:opacity-[0.05]" />
      </div>


      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <Header />
          <Outlet />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </ThemeProvider>
    </>
  ),
})
