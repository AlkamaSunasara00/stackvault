'use client'

import React, { useEffect, useRef } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { clsx } from 'clsx'

interface StatsCardProps {
  icon: React.ReactNode
  label: string
  value: number
  change?: number
  colorClass: string
  index?: number
}

function AnimatedNumber({ target }: { target: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const motionVal = useMotionValue(0)

  useEffect(() => {
    const controls = animate(motionVal, target, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (nodeRef.current) nodeRef.current.textContent = Math.round(v).toString()
      },
    })
    return controls.stop
  }, [target, motionVal])

  return <span ref={nodeRef}>0</span>
}

export function StatsCard({ icon, label, value, change, colorClass, index = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      whileHover={{ scale: 1.015 }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', colorClass)}>
          {icon}
        </div>
        {change !== undefined && (
          <div
            className={clsx(
              'flex items-center gap-0.5 text-xs font-medium',
              change >= 0 ? 'text-success' : 'text-danger'
            )}
          >
            <span>{change >= 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">
        <AnimatedNumber target={value} />
      </div>
      <p className="text-sm text-muted">{label}</p>
    </motion.div>
  )
}

export function StatsCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card p-5 animate-pulse"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
      </div>
      <div className="h-8 bg-white/[0.06] rounded w-16 mb-2" />
      <div className="h-4 bg-white/[0.04] rounded w-24" />
    </motion.div>
  )
}
