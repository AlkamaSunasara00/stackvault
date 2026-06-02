'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ActivityLog } from '@/types'
import { useAuth } from '@/hooks/useAuth'

async function fetchActivity(projectId?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page), limit: '20' })
  if (projectId) params.set('projectId', projectId)
  const { data } = await axios.get<{ logs: ActivityLog[]; total: number }>(`/api/activity?${params}`)
  return data
}

export function useActivity(projectId?: string, page = 1) {
  const { session, user } = useAuth()

  return useQuery({
    queryKey: ['activity', projectId, page],
    queryFn: () => fetchActivity(projectId, page),
    enabled: !!session || !!user,
    staleTime: 1000 * 30,
  })
}
