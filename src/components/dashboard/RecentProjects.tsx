'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useProjects } from '@/hooks/useProjects'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Avatar } from '@/components/ui/Avatar'
import { formatRelative } from '@/utils/formatDate'
import { ArrowRight, FolderKanban } from 'lucide-react'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export function RecentProjects() {
  const { projects, isLoading } = useProjects({ sort: 'updatedAt' })
  const recent = projects.slice(0, 5)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-4 animate-pulse flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-white/[0.06] rounded w-1/3 mb-1.5" />
              <div className="h-3 bg-white/[0.04] rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (recent.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <FolderKanban className="w-8 h-8 text-muted mx-auto mb-3 opacity-50" />
        <p className="text-muted text-sm">No projects yet</p>
        <Link href="/projects" className="text-primary text-sm hover:underline mt-1 inline-block">
          Create your first project →
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-2"
    >
      {recent.map((project) => (
        <motion.div key={project.id} variants={itemVariants}>
          <Link
            href={`/projects/${project.id}/overview`}
            className="glass-card p-4 flex items-center gap-3 hover:border-white/[0.15] cursor-pointer group block"
          >
            <Avatar src={project.logo_url} name={project.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                {project.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={project.status} showDot />
                <span className="text-xs text-muted">{formatRelative(project.updated_at)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 max-w-[120px] justify-end">
              {project.tech_stack.slice(0, 2).map((tech) => (
                <span
                  key={tech}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted"
                >
                  {tech}
                </span>
              ))}
            </div>
            <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>
        </motion.div>
      ))}
      <Link
        href="/projects"
        className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"
      >
        View all projects <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  )
}
