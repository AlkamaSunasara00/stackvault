'use client'

import React, { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, ChevronDown, Settings, LogOut, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSearch } from '@/context/SearchContext'
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
  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)

  const pageTitle = routeTitles[pathname] || 'DevVault'
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
    <header className="fixed top-0 right-0 left-0 lg:left-60 z-20 h-16 flex items-center px-4 lg:px-6 gap-4 border-b border-white/[0.06] bg-background/80 backdrop-blur-sm transition-all duration-300">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-muted hover:text-white transition-colors p-1"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="text-white font-semibold text-lg hidden sm:block">{pageTitle}</h1>

      {/* Search */}
      <button
        onClick={openSearch}
        className="hidden sm:flex flex-1 max-w-xs items-center gap-2.5 px-3 py-2 rounded-full bg-white/5 border border-white/[0.08] text-muted hover:text-white hover:border-white/[0.15] transition-all duration-150 text-sm group"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search anything...</span>
        <kbd className="text-xs bg-white/5 border border-white/[0.08] rounded px-1.5 py-0.5 font-mono group-hover:border-white/[0.15]">
          Ctrl+K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        {/* Mobile search icon */}
        <button
          onClick={openSearch}
          className="sm:hidden text-muted hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); if (!notifOpen) markAllRead() }}
            className="relative p-2 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-black"
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
                className="absolute right-0 mt-1 w-80 bg-[#1a2235] border border-white/[0.08] rounded-xl shadow-modal py-2 max-h-96 overflow-y-auto"
              >
                <p className="px-4 py-2 text-xs font-semibold text-muted uppercase tracking-wider border-b border-white/[0.06] mb-1">
                  Notifications
                </p>
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-muted text-center">No notifications</p>
                ) : (
                  notifications.slice(0, 20).map((n) => (
                    <div
                      key={n.id}
                      className={clsx(
                        'px-4 py-2.5 hover:bg-white/[0.03] transition-colors',
                        !n.read && 'bg-primary/[0.03]'
                      )}
                    >
                      <p className="text-sm text-white/90">{n.message}</p>
                      <p className="text-xs text-muted mt-0.5">{formatRelative(n.createdAt)}</p>
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
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
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
                className="absolute right-0 mt-1 w-52 bg-[#1a2235] border border-white/[0.08] rounded-xl shadow-modal py-2"
              >
                <div className="px-4 py-2.5 border-b border-white/[0.06] mb-1">
                  <p className="text-sm font-medium text-white">{displayName}</p>
                  <p className="text-xs text-muted">{user?.email}</p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setAvatarOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={() => { setAvatarOpen(false); signOut() }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
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
