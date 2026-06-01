'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { ProjectStatus } from '@/types'
import { PROJECT_STATUSES } from '@/utils/constants'

interface StatusBadgeProps {
  status: ProjectStatus
  showDot?: boolean
  className?: string
}

const pulsing: ProjectStatus[] = [ProjectStatus.DEVELOPMENT, ProjectStatus.PRODUCTION]

export function StatusBadge({ status, showDot = true, className }: StatusBadgeProps) {
  const config = PROJECT_STATUSES.find((s) => s.value === status)
  if (!config) return null
  const isPulsing = pulsing.includes(status)

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border',
        config.color,
        className
      )}
    >
      {showDot && (
        <span className="relative flex h-1.5 w-1.5">
          {isPulsing && (
            <motion.span
              animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className={clsx(
                'absolute inline-flex h-full w-full rounded-full opacity-75',
                status === ProjectStatus.PRODUCTION ? 'bg-primary' : 'bg-yellow-400'
              )}
            />
          )}
          <span
            className={clsx(
              'relative inline-flex rounded-full h-1.5 w-1.5',
              status === ProjectStatus.PLANNING && 'bg-blue-400',
              status === ProjectStatus.DEVELOPMENT && 'bg-yellow-400',
              status === ProjectStatus.TESTING && 'bg-orange-400',
              status === ProjectStatus.PRODUCTION && 'bg-primary',
              status === ProjectStatus.COMPLETED && 'bg-gray-400'
            )}
          />
        </span>
      )}
      {config.label}
    </span>
  )
}
