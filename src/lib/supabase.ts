import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  return createBrowserClient(url, key)
}

// Singleton for use in client components
let client: ReturnType<typeof createClient> | undefined

export function getSupabaseClient() {
  if (!client) {
    client = createClient()
  }
  return client
}

export const supabase = getSupabaseClient()
