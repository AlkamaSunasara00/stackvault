'use client'

import { use } from 'react'
import { CredentialsVault } from '@/components/vault/CredentialsVault'

export default function CredentialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <CredentialsVault projectId={id} />
}
