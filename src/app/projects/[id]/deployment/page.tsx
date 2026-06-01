'use client'

import { use } from 'react'
import { DeploymentTracker } from '@/components/vault/DeploymentTracker'

export default function DeploymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <DeploymentTracker projectId={id} />
}
