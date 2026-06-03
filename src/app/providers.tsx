'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { SearchProvider } from '@/context/SearchContext'
import { SidebarProvider } from '@/context/SidebarContext'
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
        <SidebarProvider>
          <SearchProvider>
            {children}
            <SearchPalette />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#FFFFFF',
                  color: '#1A1A1A',
                  border: '1px solid #EDEDEB',
                  boxShadow: '0 4px 12px rgba(15,15,15,0.08)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: { primary: '#5C1BE6', secondary: '#FFFFFF' },
                },
                error: {
                  iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' },
                },
              }}
            />
          </SearchProvider>
        </SidebarProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
