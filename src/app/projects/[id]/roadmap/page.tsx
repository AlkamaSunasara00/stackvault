'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { RoadmapManager } from '@/components/vault/RoadmapManager'

export default function ProjectRoadmapPage() {
  const params = useParams<{ id: string }>()
  const projectId = params?.id

  if (!projectId) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Product Roadmap & Features</h2>
        <p className="text-muted text-sm">Plan, prioritize, and track milestones, tasks, and stories for this project.</p>
      </div>
      <RoadmapManager projectId={projectId} />
    </div>
  )
}
