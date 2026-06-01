'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Project, ProjectStatus } from '@/types'
import { useAuth } from '@/hooks/useAuth'

interface ProjectFilters {
  status?: ProjectStatus | 'all'
  archived?: boolean
  sort?: 'updatedAt' | 'name' | 'createdAt'
}

async function fetchProjects(filters: ProjectFilters = {}) {
  const params = new URLSearchParams()
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.archived !== undefined) params.set('archived', String(filters.archived))
  if (filters.sort) params.set('sort', filters.sort)
  const { data } = await axios.get<{ projects: Project[] }>(`/api/projects?${params}`)
  return data.projects
}

async function createProject(formData: FormData) {
  const { data } = await axios.post<{ project: Project }>('/api/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.project
}

async function updateProject({ id, formData }: { id: string; formData: FormData }) {
  const { data } = await axios.put<{ project: Project }>(`/api/projects/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.project
}

async function deleteProject(id: string) {
  await axios.delete(`/api/projects/${id}`)
}

async function toggleFavorite(projectId: string) {
  const { data } = await axios.post<{ favorited: boolean }>('/api/favorites', { projectId })
  return data
}

export function useProjects(filters: ProjectFilters = {}) {
  const { session } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => fetchProjects(filters),
    enabled: !!session,
    staleTime: 1000 * 60 * 2,
  })

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.setQueryData(['project', updated.id], updated)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] })
      const prev = queryClient.getQueryData<Project[]>(['projects', filters])
      queryClient.setQueryData<Project[]>(
        ['projects', filters],
        (old) => old?.filter((p) => p.id !== deletedId) ?? []
      )
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['projects', filters], ctx.prev)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const favoriteMutation = useMutation({
    mutationFn: toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  return {
    projects: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createProject: createMutation.mutateAsync,
    updateProject: updateMutation.mutateAsync,
    deleteProject: deleteMutation.mutateAsync,
    toggleFavorite: favoriteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
