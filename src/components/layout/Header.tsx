'use client'

import React, { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, ChevronDown, Settings, LogOut, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSearch } from '@/context/SearchContext'
import { useSidebar } from '@/context/SidebarContext'
import { Avatar } from '@/components/ui/Avatar'
import { formatRelative } from '@/utils/formatDate'
import { clsx } from 'clsx'
import Link from 'next/link'

interface HeaderProps {
  onMenuClick?: () => void
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/favorites': 'Favorites',
  '/settings': 'Settings',
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const { user, supabaseUser, notifications, unreadCount, markAllRead, signOut } = useAuth()
  const { openSearch } = useSearch()
  const { collapsed } = useSidebar()
  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)

  const pageTitle = routeTitles[pathname] || 'StackVault'
  const displayName = user?.name || supabaseUser?.user_metadata?.name || 'User'
  const avatarUrl = user?.avatar_url || supabaseUser?.user_metadata?.avatar_url

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className={clsx(
      "fixed top-0 right-0 z-20 h-16 flex items-center px-4 lg:px-6 gap-4 border-b border-border bg-background/80 backdrop-blur-sm transition-all duration-300",
      collapsed ? "left-0 lg:left-16" : "left-0 lg:left-60"
    )}>
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-muted hover:text-white/90 transition-colors p-1"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="text-white/90 font-semibold text-lg hidden sm:block">{pageTitle}</h1>

      {/* Search */}
      <button
        onClick={openSearch}
        className="hidden sm:flex flex-1 max-w-xs items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-border text-white/40 hover:text-white/80 hover:bg-white/[0.05] transition-all duration-150 text-sm group"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search workspace...</span>
        <kbd className="text-xs bg-white/[0.04] border border-white/10 rounded px-1.5 py-0.5 font-mono group-hover:border-white/20">
          Ctrl+K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        {user?.is_guest && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-semibold select-none shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
            <span className="hidden xs:inline">Guest View-Only</span>
            <span className="xs:hidden">Guest</span>
          </div>
        )}

        {/* Mobile search icon */}
        <button
          onClick={openSearch}
          className="sm:hidden text-muted hover:text-white/90 transition-colors p-1.5 rounded-lg hover:bg-white/[0.04]"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); if (!notifOpen) markAllRead() }}
            className="relative p-2 rounded-lg text-muted hover:text-white/90 hover:bg-white/[0.04] transition-colors"
          >
            <Bell className="w-5 h-5" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-1 w-80 bg-[#252525] border border-border rounded-lg shadow-md py-2 max-h-96 overflow-y-auto z-50"
              >
                <p className="px-4 py-2 text-xs font-semibold text-white/50 uppercase tracking-wider border-b border-border mb-1">
                  Notifications
                </p>
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-white/30 text-center">No notifications</p>
                ) : (
                  notifications.slice(0, 20).map((n) => (
                    <div
                      key={n.id}
                      className={clsx(
                        'px-4 py-2.5 hover:bg-white/[0.02] transition-colors border-b border-border/50 last:border-b-0',
                        !n.read && 'bg-primary/[0.03]'
                      )}
                    >
                      <p className="text-sm text-white/90 font-medium">{n.message}</p>
                      <p className="text-xs text-white/40 mt-0.5">{formatRelative(n.createdAt)}</p>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar dropdown */}
        <div ref={avatarRef} className="relative">
          <button
            onClick={() => setAvatarOpen((v) => !v)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <Avatar src={avatarUrl} name={displayName} size="sm" />
            <ChevronDown className={clsx('w-3.5 h-3.5 text-muted transition-transform', avatarOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {avatarOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-1 w-52 bg-[#252525] border border-border rounded-lg shadow-md py-2 z-50"
              >
                <div className="px-4 py-2.5 border-b border-border mb-1">
                  <p className="text-sm font-medium text-white/90">{displayName}</p>
                  <p className="text-xs text-white/40 truncate">{user?.email || supabaseUser?.email}</p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setAvatarOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-white/70 hover:bg-white/[0.04] hover:text-white/90 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={() => { setAvatarOpen(false); signOut() }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-[#3b1111] transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
