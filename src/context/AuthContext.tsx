'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { User, Notification } from '@/types'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  session: Session | null
  loading: boolean
  notifications: Notification[]
  unreadCount: number
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markAllRead: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const NOTIFICATIONS_KEY = 'devvault_notifications'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const syncedRef = useRef<Set<string>>(new Set())

  // Load notifications from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY)
      if (stored) setNotifications(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [])

  // Persist notifications
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications.slice(0, 50)))
    } catch {
      // ignore
    }
  }, [notifications])

  const syncUserToDb = useCallback(
    async (supaUser: SupabaseUser) => {
      if (syncedRef.current.has(supaUser.id)) return
      syncedRef.current.add(supaUser.id)
      try {
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: supaUser.id,
            email: supaUser.email,
            name: supaUser.user_metadata?.name || supaUser.email?.split('@')[0] || 'User',
            avatar_url: supaUser.user_metadata?.avatar_url || null,
          }),
        })
        const profileRes = await fetch('/api/auth/profile')
        if (profileRes.ok) {
          const data = await profileRes.json()
          setUser(data.user)
        }
      } catch {
        // non-critical
      }
    },
    []
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setSupabaseUser(s?.user ?? null)
      if (s?.user) syncUserToDb(s.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setSupabaseUser(s?.user ?? null)
      if (s?.user) syncUserToDb(s.user)
      else setUser(null)
    })

    return () => subscription.unsubscribe()
  }, [supabase, syncUserToDb])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message)
      router.push('/dashboard')
    },
    [supabase, router]
  )

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) throw new Error(error.message)
      router.push('/dashboard')
    },
    [supabase, router]
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }, [supabase, router])

  const updateProfile = useCallback(async (data: Partial<User>) => {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update profile')
    const json = await res.json()
    setUser(json.user)
  }, [])

  const addNotification = useCallback(
    (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
      const notification: Notification = {
        ...n,
        id: crypto.randomUUID(),
        read: false,
        createdAt: new Date().toISOString(),
      }
      setNotifications((prev) => [notification, ...prev].slice(0, 50))
      toast.success(n.message, {
        style: {
          background: '#161E2E',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.08)',
        },
        iconTheme: { primary: '#22C55E', secondary: '#161E2E' },
      })
    },
    []
  )

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        loading,
        notifications,
        unreadCount,
        signIn,
        signUp,
        signOut,
        updateProfile,
        addNotification,
        markAllRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
