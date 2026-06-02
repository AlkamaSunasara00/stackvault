'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star, MoreVertical, Pencil, Archive, Trash2, Clock } from 'lucide-react'
import { Project } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Avatar } from '@/components/ui/Avatar'
import { Dropdown } from '@/components/ui/Dropdown'
import { ConfirmModal } from '@/components/ui/Modal'
import { EditProjectModal } from '@/components/projects/EditProjectModal'
import { formatRelative } from '@/utils/formatDate'
import { useProjects } from '@/hooks/useProjects'
import { useAuth } from '@/hooks/useAuth'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

interface ProjectCardProps {
  project: Project
  isFavorited?: boolean
}

export const ProjectCard = React.memo(function ProjectCard({
  project,
  isFavorited = false,
}: ProjectCardProps) {
  const { deleteProject, toggleFavorite, updateProject } = useProjects()
  const { addNotification, user } = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [favorited, setFavorited] = useState(isFavorited)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const next = !favorited
      setFavorited(next)
      try {
        await toggleFavorite(project.id)
      } catch {
        setFavorited(!next)
      }
    },
    [favorited, toggleFavorite, project.id]
  )

  const handleDelete = useCallback(async () => {
    setIsDeleting(true)
    try {
      await deleteProject(project.id)
      addNotification({ title: 'Project deleted', message: `"${project.name}" was deleted.`, type: 'success' })
    } catch {
      toast.error('Failed to delete project')
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
    }
  }, [deleteProject, project.id, project.name, addNotification])

  const handleArchive = useCallback(async () => {
    const fd = new FormData()
    fd.set('is_archived', String(!project.is_archived))
    try {
      await updateProject({ id: project.id, formData: fd })
      addNotification({
        title: project.is_archived ? 'Project unarchived' : 'Project archived',
        message: `"${project.name}" was ${project.is_archived ? 'unarchived' : 'archived'}.`,
        type: 'success',
      })
    } catch {
      toast.error('Failed to archive project')
    }
  }, [updateProject, project, addNotification])

  const menuItems = [
    { label: 'Edit', icon: <Pencil className="w-3.5 h-3.5" />, onClick: () => setEditOpen(true) },
    {
      label: project.is_archived ? 'Unarchive' : 'Archive',
      icon: <Archive className="w-3.5 h-3.5" />,
      onClick: handleArchive,
    },
    {
      label: 'Delete',
      icon: <Trash2 className="w-3.5 h-3.5" />,
      onClick: () => setDeleteOpen(true),
      variant: 'danger' as const,
    },
  ]

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.015 }}
        transition={{ duration: 0.18 }}
        className="glass-card p-5 flex flex-col gap-4 relative group"
      >
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar src={project.logo_url} name={project.name} size="md" />
            <div className="min-w-0">
              <Link
                href={`/projects/${project.id}/overview`}
                className="text-white font-semibold text-sm leading-tight hover:text-primary transition-colors line-clamp-1"
              >
                {project.name}
              </Link>
              {project.client_name && (
                <p className="text-xs text-muted mt-0.5 truncate">{project.client_name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            {!user?.is_guest && (
              <>
                <button
                  onClick={handleFavorite}
                  className={clsx(
                    'p-1.5 rounded-lg transition-colors',
                    favorited
                      ? 'text-warning bg-warning/10'
                      : 'text-muted hover:text-warning hover:bg-warning/10 opacity-0 group-hover:opacity-100'
                  )}
                >
                  <Star className={clsx('w-4 h-4', favorited && 'fill-current')} />
                </button>
                <Dropdown
                  trigger={
                    <button className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  }
                  items={menuItems}
                />
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-muted line-clamp-2 leading-relaxed -mt-2">
            {project.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <StatusBadge status={project.status} />
          <div className="flex items-center gap-1 text-xs text-muted">
            <Clock className="w-3 h-3" />
            {formatRelative(project.updated_at)}
          </div>
        </div>

        {/* Tech stack */}
        {project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 -mt-2">
            {project.tech_stack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.06] text-muted"
              >
                {tech}
              </span>
            ))}
            {project.tech_stack.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-muted">
                +{project.tech_stack.length - 3}
              </span>
            )}
          </div>
        )}
      </motion.div>

      <EditProjectModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        project={project}
      />

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This will permanently delete all associated links, notes, roadmap tasks, and credentials.`}
        confirmLabel="Delete Project"
        isLoading={isDeleting}
        dangerous
      />
    </>
  )
})
