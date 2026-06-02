'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Project, ProjectLink, ProjectNote, Environment, EnvironmentVariable, Credential, ProjectIntegration } from '@/types'

async function fetchProject(id: string) {
  const { data } = await axios.get<{ project: Project }>(`/api/projects/${id}`)
  return data.project
}

export function useProject(id: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  })

  // ---- Links ----
  const createLink = useMutation({
    mutationFn: (data: Partial<ProjectLink>) =>
      axios.post('/api/links', { ...data, project_id: id }).then((r) => r.data.link),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  const updateLink = useMutation({
    mutationFn: ({ linkId, data }: { linkId: string; data: Partial<ProjectLink> }) =>
      axios.put(`/api/links/${linkId}`, data).then((r) => r.data.link),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  const deleteLink = useMutation({
    mutationFn: (linkId: string) => axios.delete(`/api/links/${linkId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  // ---- Notes ----
  const createNote = useMutation({
    mutationFn: (data: Partial<ProjectNote>) =>
      axios.post('/api/notes', { ...data, project_id: id }).then((r) => r.data.note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  const updateNote = useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: Partial<ProjectNote> }) =>
      axios.put(`/api/notes/${noteId}`, data).then((r) => r.data.note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  const deleteNote = useMutation({
    mutationFn: (noteId: string) => axios.delete(`/api/notes/${noteId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  // ---- Integrations ----
  const createIntegration = useMutation({
    mutationFn: (data: Partial<ProjectIntegration>) =>
      axios.post('/api/integrations', { ...data, project_id: id }).then((r) => r.data.integration),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  const updateIntegration = useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: Partial<ProjectIntegration> }) =>
      axios.put(`/api/integrations/${itemId}`, data).then((r) => r.data.integration),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  const deleteIntegration = useMutation({
    mutationFn: (itemId: string) => axios.delete(`/api/integrations/${itemId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  // ---- Environments ----
  const createEnvironment = useMutation({
    mutationFn: (name: string) =>
      axios.post('/api/environments', { name, project_id: id }).then((r) => r.data.environment),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  const createEnvVariable = useMutation({
    mutationFn: (data: Partial<EnvironmentVariable>) =>
      axios.post('/api/environments/variables', data).then((r) => r.data.variable),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  const createEnvVariablesBulk = useMutation({
    mutationFn: (data: { environment_id: string; variables: Array<{ key: string; value: string; is_secret: boolean; description?: string }> }) =>
      axios.post('/api/environments/variables', data).then((r) => r.data.variables),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  const updateEnvVariable = useMutation({
    mutationFn: ({ varId, data }: { varId: string; data: Partial<EnvironmentVariable> }) =>
      axios.put(`/api/environments/variables/${varId}`, data).then((r) => r.data.variable),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  const deleteEnvVariable = useMutation({
    mutationFn: (varId: string) => axios.delete(`/api/environments/variables/${varId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  // ---- Credentials ----
  const createCredential = useMutation({
    mutationFn: (data: Partial<Credential>) =>
      axios.post('/api/credentials', { ...data, project_id: id }).then((r) => r.data.credential),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  const updateCredential = useMutation({
    mutationFn: ({ credId, data }: { credId: string; data: Partial<Credential> }) =>
      axios.put(`/api/credentials/${credId}`, data).then((r) => r.data.credential),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  const deleteCredential = useMutation({
    mutationFn: (credId: string) => axios.delete(`/api/credentials/${credId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  return {
    project: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    // Links
    createLink: createLink.mutateAsync,
    updateLink: updateLink.mutateAsync,
    deleteLink: deleteLink.mutateAsync,
    // Notes
    createNote: createNote.mutateAsync,
    updateNote: updateNote.mutateAsync,
    deleteNote: deleteNote.mutateAsync,
    // Integrations
    createIntegration: createIntegration.mutateAsync,
    updateIntegration: updateIntegration.mutateAsync,
    deleteIntegration: deleteIntegration.mutateAsync,
    // Environments
    createEnvironment: createEnvironment.mutateAsync,
    createEnvVariable: createEnvVariable.mutateAsync,
    createEnvVariablesBulk: createEnvVariablesBulk.mutateAsync,
    updateEnvVariable: updateEnvVariable.mutateAsync,
    deleteEnvVariable: deleteEnvVariable.mutateAsync,
    // Credentials
    createCredential: createCredential.mutateAsync,
    updateCredential: updateCredential.mutateAsync,
    deleteCredential: deleteCredential.mutateAsync,
  }
}
