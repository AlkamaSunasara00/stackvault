'use client'

import { use } from 'react'
import { CommandsVault } from '@/components/vault/CommandsVault'

export default function CommandsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <CommandsVault projectId={id} />
}
