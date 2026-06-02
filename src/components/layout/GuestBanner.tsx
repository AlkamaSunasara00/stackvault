'use client'

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Eye } from 'lucide-react'
import { motion } from 'framer-motion'

export function GuestBanner() {
  const { user } = useAuth()

  if (!user?.is_guest) return null

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-amber-500/10 border-b border-amber-500/20 backdrop-blur-md px-4 py-2.5 text-center relative z-50 overflow-hidden flex items-center justify-center gap-2"
    >
      <div className="absolute inset-0 bg-amber-500/[0.02] animate-pulse pointer-events-none" />
      <Eye className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
      <span className="text-xs font-medium text-amber-200/90 tracking-wide flex items-center gap-1.5 select-none">
        <span className="font-bold uppercase bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px] text-amber-300 border border-amber-500/30">
          View-Only Guest Mode
        </span>
        You have read-only access to this account. Adding, editing, and deleting items has been disabled.
      </span>
    </motion.div>
  )
}
