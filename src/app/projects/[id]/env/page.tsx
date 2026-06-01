'use client'

import { use } from 'react'
import { EnvManager } from '@/components/vault/EnvManager'

export default function EnvPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <EnvManager projectId={id} />
}
