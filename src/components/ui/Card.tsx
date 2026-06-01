'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({
  children,
  className,
  hover = false,
  onClick,
  padding = 'md',
}: CardProps) {
  if (hover || onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.015 }}
        transition={{ duration: 0.18 }}
        onClick={onClick}
        className={clsx(
          'glass-card',
          paddingClasses[padding],
          onClick && 'cursor-pointer',
          className
        )}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      className={clsx('glass-card', paddingClasses[padding], className)}
    >
      {children}
    </div>
  )
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('glass-card p-5 animate-pulse', className)}>
      <div className="h-4 bg-white/[0.06] rounded w-3/4 mb-3" />
      <div className="h-3 bg-white/[0.04] rounded w-1/2 mb-2" />
      <div className="h-3 bg-white/[0.04] rounded w-2/3" />
    </div>
  )
}
