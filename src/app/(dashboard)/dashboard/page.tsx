'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FolderKanban, Link, Lock, Star, ListTodo } from 'lucide-react'
import { StatsCard, StatsCardSkeleton } from '@/components/dashboard/StatsCard'
import { RecentProjects } from '@/components/dashboard/RecentProjects'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { AnalyticsChart } from '@/components/dashboard/AnalyticsChart'
import { useProjects } from '@/hooks/useProjects'
import { useAuth } from '@/hooks/useAuth'

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3 },
  }),
}

export default function DashboardPage() {
  const { user, supabaseUser } = useAuth()
  const { projects, isLoading } = useProjects()

  const stats = {
    total: projects.length,
    links: projects.reduce((acc, p) => acc + (p._count?.links ?? 0), 0),
    roadmap: projects.reduce((acc, p) => acc + (p._count?.roadmap ?? 0), 0),
    credentials: projects.reduce((acc, p) => acc + (p._count?.credentials ?? 0), 0),
    favorites: projects.filter((p) => p.favorites && p.favorites.length > 0).length,
  }

  const displayName = user?.name || supabaseUser?.user_metadata?.name || 'Developer'
  const firstName = displayName.split(' ')[0]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const statItems = [
    { icon: <FolderKanban className="w-5 h-5 text-primary" />, label: 'Total Projects', value: stats.total, colorClass: 'bg-primary/20' },
    { icon: <ListTodo className="w-5 h-5 text-sky-400" />, label: 'Roadmap Tasks', value: stats.roadmap, colorClass: 'bg-sky-500/20' },
    { icon: <Link className="w-5 h-5 text-secondary" />, label: 'Saved Links', value: stats.links, colorClass: 'bg-secondary/20' },
    { icon: <Lock className="w-5 h-5 text-purple-400" />, label: 'Credentials', value: stats.credentials, colorClass: 'bg-purple-500/20' },
    { icon: <Star className="w-5 h-5 text-yellow-400" />, label: 'Favorites', value: stats.favorites, colorClass: 'bg-yellow-500/20' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl lg:text-3xl font-bold text-white">
          {getGreeting()}, {firstName} 👋
        </h2>
        <p className="text-muted mt-1">
          You have <span className="text-white font-medium">{projects.length}</span> active project
          {projects.length !== 1 ? 's' : ''} in your vault.
        </p>
      </motion.div>

      {/* Quick actions */}
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="show">
        <QuickActions />
      </motion.div>

      {/* Stats grid */}
      <div>
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {isLoading
            ? [...Array(5)].map((_, i) => <StatsCardSkeleton key={i} index={i} />)
            : statItems.map((stat, i) => (
                <StatsCard key={stat.label} {...stat} index={i} />
              ))}
        </div>
      </div>

      {/* Recent projects + analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div custom={2} variants={fadeIn} initial="hidden" animate="show" className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Recent Projects</h3>
          <RecentProjects />
        </motion.div>

        <motion.div custom={3} variants={fadeIn} initial="hidden" animate="show" className="space-y-3">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Status Breakdown</h3>
          <div className="glass-card p-5">
            <AnalyticsChart />
          </div>
        </motion.div>
      </div>

      {/* Activity */}
      <motion.div custom={4} variants={fadeIn} initial="hidden" animate="show" className="space-y-3">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Recent Activity</h3>
        <div className="glass-card p-5">
          <ActivityFeed />
        </div>
      </motion.div>
    </div>
  )
}
