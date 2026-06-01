'use client'

import React from 'react'
import { clsx } from 'clsx'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
}

function getInitials(name?: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getColor(name?: string): string {
  const colors = [
    'from-primary/80 to-secondary/80',
    'from-purple-500/80 to-pink-500/80',
    'from-orange-500/80 to-yellow-500/80',
    'from-cyan-500/80 to-blue-500/80',
    'from-rose-500/80 to-red-500/80',
  ]
  if (!name) return colors[0]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={clsx('rounded-full object-cover shrink-0', sizeMap[size], className)}
      />
    )
  }

  return (
    <div
      className={clsx(
        'rounded-full shrink-0 flex items-center justify-center font-semibold text-white bg-gradient-to-br',
        getColor(name),
        sizeMap[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
