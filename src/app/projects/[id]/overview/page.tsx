'use client'

import React from 'react'
import { use } from 'react'
import { motion } from 'framer-motion'
import { useProject } from '@/hooks/useProject'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate, formatRelative } from '@/utils/formatDate'
import {
  Link as LinkIcon, Lock, FileText, FileCode, ListTodo,
  Star, Clock, Calendar, User,
} from 'lucide-react'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { clsx } from 'clsx'
import Link from 'next/link'

const statCards = [
  { key: 'tasks', label: 'Tasks', icon: ListTodo, color: 'text-sky-400', bg: 'bg-sky-500/20', href: 'tasks' },
  { key: 'links', label: 'Links', icon: LinkIcon, color: 'text-secondary', bg: 'bg-secondary/20', href: 'links' },
  { key: 'notes', label: 'Notes', icon: FileText, color: 'text-warning', bg: 'bg-warning/20', href: 'notes' },
  { key: 'credentials', label: 'Credentials', icon: Lock, color: 'text-purple-400', bg: 'bg-purple-500/20', href: 'credentials' },
] as const

interface OverviewProps {
  params: Promise<{ id: string }>
}

export default function OverviewPage({ params }: OverviewProps) {
  const { id } = use(params)
  const { project, isLoading } = useProject(id)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.06]" />
            <div>
              <div className="h-6 bg-white/[0.06] rounded w-48 mb-2" />
              <div className="h-4 bg-white/[0.04] rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-muted">Project not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Project hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-start gap-4 flex-wrap">
          <Avatar src={project.logo_url} name={project.name} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            {project.client_name && (
              <p className="text-muted text-sm flex items-center gap-1.5 mb-2">
                <User className="w-3.5 h-3.5" /> {project.client_name}
              </p>
            )}
            {project.description && (
              <p className="text-white/70 text-sm leading-relaxed mb-4 max-w-2xl">
                {project.description}
              </p>
            )}

            {/* Tech stack */}
            {project.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.06] text-white/70 font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="text-right space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted justify-end">
              <Calendar className="w-3.5 h-3.5" />
              Created {formatDate(project.created_at)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted justify-end">
              <Clock className="w-3.5 h-3.5" />
              Updated {formatRelative(project.updated_at)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((card, i) => {
          const count = project._count?.[card.key as keyof typeof project._count] ?? 0
          const Icon = card.icon
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={`/projects/${id}/${card.href}`}
                className="glass-card p-4 flex flex-col gap-2 group hover:border-white/[0.15] block"
              >
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', card.bg)}>
                  <Icon className={clsx('w-4 h-4', card.color)} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{count}</p>
                  <p className="text-xs text-muted group-hover:text-white transition-colors">{card.label}</p>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Activity */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Project Activity</h3>
        <ActivityFeed projectId={id} />
      </div>
    </div>
  )
}
