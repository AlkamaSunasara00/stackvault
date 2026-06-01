'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useProjects } from '@/hooks/useProjects'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { Button } from '@/components/ui/Button'
import { PROJECT_STATUSES } from '@/utils/constants'
import { ProjectStatus } from '@/types'
import { FolderPlus, Search, SlidersHorizontal, Archive } from 'lucide-react'
import { clsx } from 'clsx'

type FilterStatus = 'all' | ProjectStatus
type SortKey = 'updatedAt' | 'name' | 'createdAt'

export default function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [sort, setSort] = useState<SortKey>('updatedAt')
  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  const { projects, isLoading } = useProjects({
    status: statusFilter,
    archived: showArchived,
    sort,
  })

  const filtered = search
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()) ||
          p.client_name?.toLowerCase().includes(search.toLowerCase())
      )
    : projects

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-muted text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''} in your vault
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} iconLeft={<FolderPlus className="w-4 h-4" />}>
          New Project
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-10"
          />
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="input-dark w-auto min-w-[160px]"
        >
          <option value="updatedAt">Sort: Recently Updated</option>
          <option value="createdAt">Sort: Newest First</option>
          <option value="name">Sort: Name A–Z</option>
        </select>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setStatusFilter('all')}
          className={clsx(
            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors',
            statusFilter === 'all'
              ? 'bg-primary/20 text-primary border-primary/30'
              : 'bg-white/5 text-muted border-white/[0.06] hover:text-white'
          )}
        >
          All ({projects.length})
        </button>
        {PROJECT_STATUSES.map((status) => {
          const count = projects.filter((p) => p.status === status.value).length
          return (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value as ProjectStatus)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors',
                statusFilter === status.value
                  ? 'bg-primary/20 text-primary border-primary/30'
                  : 'bg-white/5 text-muted border-white/[0.06] hover:text-white'
              )}
            >
              {status.label} ({count})
            </button>
          )
        })}
        <button
          onClick={() => setShowArchived((v) => !v)}
          className={clsx(
            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors flex items-center gap-1',
            showArchived
              ? 'bg-warning/20 text-warning border-warning/30'
              : 'bg-white/5 text-muted border-white/[0.06] hover:text-white'
          )}
        >
          <Archive className="w-3 h-3" />
          Archived
        </button>
      </div>

      {/* Projects grid */}
      <ProjectGrid
        projects={filtered}
        isLoading={isLoading}
        emptyMessage={
          search
            ? `No projects match "${search}"`
            : statusFilter !== 'all'
            ? `No ${statusFilter.toLowerCase()} projects`
            : 'No projects yet'
        }
        onCreateClick={() => setCreateOpen(true)}
      />

      <CreateProjectModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
