'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FolderKanban, Star, Settings, LogOut, Zap, ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSidebar } from '@/context/SidebarContext'
import { Avatar } from '@/components/ui/Avatar'
import { clsx } from 'clsx'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/favorites', label: 'Favorites', icon: Star },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25 } },
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, supabaseUser, signOut } = useAuth()
  const { collapsed, toggleCollapsed } = useSidebar()

  const displayName = user?.name || supabaseUser?.user_metadata?.name || 'User'
  const displayEmail = user?.email || supabaseUser?.email || ''
  const avatarUrl = user?.avatar_url || supabaseUser?.user_metadata?.avatar_url

  return (
    <motion.aside
      initial={{ x: -240 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={clsx(
        'fixed left-0 top-0 bottom-0 z-30 flex flex-col',
        'bg-sidebar border-r border-[#EDEDEB]',
        'transition-all duration-300',
        collapsed ? 'w-16' : 'w-60',
        'hidden lg:flex'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/90 font-bold text-lg tracking-tight"
          >
            StackVault
          </motion.span>
        )}
        <button
          onClick={toggleCollapsed}
          className={clsx(
            'ml-auto text-muted hover:text-white/90 transition-colors p-1 rounded-lg hover:bg-white/[0.04]',
            collapsed && 'mx-auto'
          )}
        >
          <ChevronRight
            className={clsx(
              'w-4 h-4 transition-transform duration-300',
              collapsed ? 'rotate-0' : 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <motion.nav
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <motion.div key={item.href} variants={itemVariants}>
              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  'border-l-2',
                  isActive
                    ? 'bg-primary/10 text-primary border-primary font-semibold'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/[0.04] border-transparent',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </motion.div>
          )
        })}
      </motion.nav>

      {/* User section */}
      <div className="p-3 border-t border-border">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 p-2 rounded-lg">
            <Avatar src={avatarUrl} name={displayName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">{displayName}</p>
              <p className="text-xs text-muted truncate">{displayEmail}</p>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              className="text-muted hover:text-danger transition-colors p-1 rounded-lg hover:bg-danger/10 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar src={avatarUrl} name={displayName} size="sm" />
            <button
              onClick={signOut}
              title="Sign out"
              className="text-muted hover:text-danger transition-colors p-1 rounded-lg hover:bg-danger/10"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
