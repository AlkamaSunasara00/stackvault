import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar_url?: string | null
  is_guest?: boolean
}

export async function getAuthUser(): Promise<AuthUser | null> {
  // 1. Check Supabase session first
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user: supaUser } } = await supabase.auth.getUser()
    if (supaUser) {
      // Find user in local DB
      const user = await prisma.user.findUnique({
        where: { id: supaUser.id },
      })
      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          is_guest: false,
        }
      }
    }
  } catch (e) {
    // Ignore error
  }

  // 2. If no Supabase user, check if we have a guest session cookie
  try {
    const cookieStore = await cookies()
    const guestSession = cookieStore.get('vault_guest_session')?.value
    if (guestSession) {
      // Find the admin user by ID
      const user = await prisma.user.findUnique({
        where: { id: guestSession },
      })
      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          is_guest: true,
        }
      }
    }
  } catch (e) {
    // Ignore error
  }

  return null
}
