'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { SearchProvider } from '@/context/SearchContext'
import { Toaster } from 'react-hot-toast'
import { SearchPalette } from '@/components/ui/SearchPalette'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SearchProvider>
          {children}
          <SearchPalette />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#161E2E',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#22C55E', secondary: '#161E2E' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#161E2E' },
              },
            }}
          />
        </SearchProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
