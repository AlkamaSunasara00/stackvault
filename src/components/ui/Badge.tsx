'use client'

import React from 'react'
import { clsx } from 'clsx'
import { ProjectStatus } from '@/types'

type BadgeVariant =
  | ProjectStatus
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'gray'
  | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  dot?: boolean
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  [ProjectStatus.PLANNING]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  [ProjectStatus.DEVELOPMENT]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [ProjectStatus.TESTING]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  [ProjectStatus.PRODUCTION]: 'bg-primary/20 text-primary border-primary/30',
  [ProjectStatus.COMPLETED]: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  success: 'bg-success/20 text-success border-success/30',
  danger: 'bg-danger/20 text-danger border-danger/30',
  warning: 'bg-warning/20 text-warning border-warning/30',
  info: 'bg-secondary/20 text-secondary border-secondary/30',
  gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  default: 'bg-white/10 text-white/70 border-white/20',
}

const dotColors: Record<BadgeVariant, string> = {
  [ProjectStatus.PLANNING]: 'bg-blue-400',
  [ProjectStatus.DEVELOPMENT]: 'bg-yellow-400',
  [ProjectStatus.TESTING]: 'bg-orange-400',
  [ProjectStatus.PRODUCTION]: 'bg-primary',
  [ProjectStatus.COMPLETED]: 'bg-gray-400',
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-secondary',
  gray: 'bg-gray-400',
  default: 'bg-white/70',
}

export function Badge({ variant = 'default', children, dot = false, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])}
        />
      )}
      {children}
    </span>
  )
}
