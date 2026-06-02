'use client'

import React from 'react'
import { use } from 'react'
import { IntegrationsManager } from '@/components/vault/IntegrationsManager'

interface IntegrationsPageProps {
  params: Promise<{ id: string }>
}

export default function ProjectIntegrationsPage({ params }: IntegrationsPageProps) {
  const { id } = use(params)

  return (
    <div className="animate-fade-in">
      <IntegrationsManager projectId={id} />
    </div>
  )
}
