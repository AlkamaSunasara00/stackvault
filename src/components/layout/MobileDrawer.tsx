'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FolderKanban, Star, Settings, LogOut, Zap, X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { clsx } from 'clsx'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/favorites', label: 'Favorites', icon: Star },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname()
  const { user, supabaseUser, signOut } = useAuth()
  const displayName = user?.name || supabaseUser?.user_metadata?.name || 'User'
  const avatarUrl = user?.avatar_url || supabaseUser?.user_metadata?.avatar_url

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-sidebar border-r border-white/[0.06] flex flex-col lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <span className="text-white font-bold text-lg">DevVault</span>
              </div>
              <button
                onClick={onClose}
                className="text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border-l-2',
                      isActive
                        ? 'bg-primary/10 text-primary border-primary'
                        : 'text-muted hover:text-white hover:bg-white/5 border-transparent'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* User */}
            <div className="p-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2.5 p-2 rounded-lg">
                <Avatar src={avatarUrl} name={displayName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{displayName}</p>
                  <p className="text-xs text-muted truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { onClose(); signOut() }}
                  className="text-muted hover:text-danger transition-colors p-1 rounded-lg hover:bg-danger/10"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
