'use client'

import { use } from 'react'
import { LinksManager } from '@/components/vault/LinksManager'

export default function LinksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <LinksManager projectId={id} />
}
