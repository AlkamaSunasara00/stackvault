'use client'

import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useProjects } from '@/hooks/useProjects'
import { ProjectStatus } from '@/types'

const statusColors: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]: '#3B82F6',
  [ProjectStatus.DEVELOPMENT]: '#F59E0B',
  [ProjectStatus.TESTING]: '#F97316',
  [ProjectStatus.PRODUCTION]: '#22C55E',
  [ProjectStatus.COMPLETED]: '#6B7280',
}

const statusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]: 'Planning',
  [ProjectStatus.DEVELOPMENT]: 'Dev',
  [ProjectStatus.TESTING]: 'Testing',
  [ProjectStatus.PRODUCTION]: 'Production',
  [ProjectStatus.COMPLETED]: 'Completed',
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass border border-white/[0.08] rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">{payload[0].value} projects</p>
    </div>
  )
}

export function AnalyticsChart() {
  const { projects } = useProjects()

  const data = Object.values(ProjectStatus).map((status) => ({
    name: statusLabels[status],
    value: projects.filter((p) => p.status === status && !p.is_archived).length,
    status,
  }))

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={statusColors[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
