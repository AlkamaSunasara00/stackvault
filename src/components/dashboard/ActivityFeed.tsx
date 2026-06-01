'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useActivity } from '@/hooks/useActivity'
import { formatRelative, formatDateGroup } from '@/utils/formatDate'
import { Plus, Pencil, Trash2, Eye, Activity } from 'lucide-react'
import { clsx } from 'clsx'

const actionConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  CREATED: { icon: <Plus className="w-3 h-3" />, color: 'bg-primary/20 text-primary', label: 'created' },
  UPDATED: { icon: <Pencil className="w-3 h-3" />, color: 'bg-secondary/20 text-secondary', label: 'updated' },
  DELETED: { icon: <Trash2 className="w-3 h-3" />, color: 'bg-danger/20 text-danger', label: 'deleted' },
  VIEWED: { icon: <Eye className="w-3 h-3" />, color: 'bg-warning/20 text-warning', label: 'viewed' },
}

export function ActivityFeed({ projectId }: { projectId?: string }) {
  const { data, isLoading } = useActivity(projectId)
  const logs = data?.logs ?? []

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-6 h-6 rounded-full bg-white/[0.06] shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="h-3.5 bg-white/[0.06] rounded w-3/4 mb-1.5" />
              <div className="h-3 bg-white/[0.04] rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-8 h-8 text-muted mx-auto mb-3 opacity-50" />
        <p className="text-muted text-sm">No activity yet</p>
      </div>
    )
  }

  // Group by date
  const groups = logs.reduce<Record<string, typeof logs>>((acc, log) => {
    const group = formatDateGroup(log.created_at)
    if (!acc[group]) acc[group] = []
    acc[group].push(log)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([date, items]) => (
        <div key={date}>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{date}</p>
          <div className="space-y-2.5">
            {items.map((log, idx) => {
              const config = actionConfig[log.action] ?? actionConfig.UPDATED
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-start gap-3"
                >
                  <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5', config.color)}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80">
                      {config.label}{' '}
                      <span className="text-white font-medium">{log.entity_name}</span>{' '}
                      <span className="text-muted text-xs">({log.entity_type.toLowerCase()})</span>
                    </p>
                    <p className="text-xs text-muted mt-0.5">{formatRelative(log.created_at)}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
