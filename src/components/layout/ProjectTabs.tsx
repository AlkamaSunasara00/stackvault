'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import {
  LayoutGrid, Link as LinkIcon, FileCode, FileText, Lock, ListTodo,
} from 'lucide-react'
import { clsx } from 'clsx'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'roadmap', label: 'Roadmap', icon: ListTodo },
  { id: 'links', label: 'Links', icon: LinkIcon },
  { id: 'env', label: 'Env Variables', icon: FileCode },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'credentials', label: 'Credentials', icon: Lock },
]

export function ProjectTabs() {
  const pathname = usePathname()
  const params = useParams<{ id: string }>()
  const projectId = params?.id

  const activeTab = tabs.find((t) => pathname.endsWith(`/${t.id}`))?.id || 'overview'

  return (
    <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none px-4 lg:px-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon
        return (
          <Link
            key={tab.id}
            href={`/projects/${projectId}/${tab.id}`}
            className={clsx(
              'relative flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors shrink-0',
              isActive ? 'text-primary' : 'text-muted hover:text-white'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="project-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        )
      })}
    </div>
  )
}
