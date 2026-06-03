'use client'

import { use } from 'react'
import { KanbanBoard } from '@/components/vault/KanbanBoard'

export default function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <KanbanBoard projectId={id} />
}
