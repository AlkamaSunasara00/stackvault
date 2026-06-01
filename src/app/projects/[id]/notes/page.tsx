'use client'

import { use } from 'react'
import { NotesEditor } from '@/components/vault/NotesEditor'

export default function NotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <NotesEditor projectId={id} />
}
