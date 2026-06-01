'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FolderKanban } from 'lucide-react'
import { Project } from '@/types'
import { ProjectCard } from '@/components/projects/ProjectCard'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

interface ProjectGridProps {
  projects: Project[]
  favoritedIds?: Set<string>
  isLoading?: boolean
  emptyMessage?: string
  onCreateClick?: () => void
}

export function ProjectGrid({
  projects,
  favoritedIds = new Set(),
  isLoading = false,
  emptyMessage = 'No projects found',
  onCreateClick,
}: ProjectGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card p-5 animate-pulse space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/[0.06]" />
              <div className="flex-1">
                <div className="h-4 bg-white/[0.06] rounded w-3/4 mb-1.5" />
                <div className="h-3 bg-white/[0.04] rounded w-1/2" />
              </div>
            </div>
            <div className="h-3 bg-white/[0.04] rounded w-full" />
            <div className="h-3 bg-white/[0.04] rounded w-4/5" />
            <div className="flex gap-2">
              <div className="h-6 bg-white/[0.06] rounded-full w-20" />
              <div className="h-6 bg-white/[0.06] rounded-full w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
          <FolderKanban className="w-8 h-8 text-muted opacity-60" />
        </div>
        <p className="text-white font-medium mb-2">{emptyMessage}</p>
        <p className="text-muted text-sm mb-6">
          Start organizing your developer projects in one place.
        </p>
        {onCreateClick && (
          <button onClick={onCreateClick} className="btn-primary text-sm">
            Create Project
          </button>
        )}
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {projects.map((project) => (
        <motion.div key={project.id} variants={itemVariants}>
          <ProjectCard project={project} isFavorited={favoritedIds.has(project.id)} />
        </motion.div>
      ))}
    </motion.div>
  )
}
