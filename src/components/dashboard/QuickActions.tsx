'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FolderPlus, FilePlus, Link as LinkIcon } from 'lucide-react'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { clsx } from 'clsx'

const actions = [
  {
    icon: <FolderPlus className="w-5 h-5" />,
    label: 'New Project',
    description: 'Start a new project vault',
    colorClass: 'bg-primary/20 text-primary border-primary/20',
    key: 'project',
  },
]

export function QuickActions() {
  const [createProjectOpen, setCreateProjectOpen] = useState(false)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCreateProjectOpen(true)}
          className={clsx(
            'flex items-center gap-3 p-4 rounded-xl border transition-all duration-150 text-left',
            'bg-primary/[0.08] border-primary/20 hover:bg-primary/[0.12] hover:border-primary/30'
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <FolderPlus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">New Project</p>
            <p className="text-xs text-muted">Start a new vault</p>
          </div>
        </motion.button>

        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="/projects"
          className={clsx(
            'flex items-center gap-3 p-4 rounded-xl border transition-all duration-150 text-left',
            'bg-secondary/[0.08] border-secondary/20 hover:bg-secondary/[0.12] hover:border-secondary/30'
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
            <FilePlus className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Browse Projects</p>
            <p className="text-xs text-muted">View all projects</p>
          </div>
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="/favorites"
          className={clsx(
            'flex items-center gap-3 p-4 rounded-xl border transition-all duration-150 text-left',
            'bg-warning/[0.08] border-warning/20 hover:bg-warning/[0.12] hover:border-warning/30'
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
            <LinkIcon className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Favorites</p>
            <p className="text-xs text-muted">Pinned projects</p>
          </div>
        </motion.a>
      </div>

      <CreateProjectModal isOpen={createProjectOpen} onClose={() => setCreateProjectOpen(false)} />
    </>
  )
}
