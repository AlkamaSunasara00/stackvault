'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket, Plus, ExternalLink, Trash2, Pencil } from 'lucide-react'
import { useProject } from '@/hooks/useProject'
import { Deployment } from '@/types'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { DEPLOYMENT_STATUSES, HOSTING_PROVIDERS } from '@/utils/constants'
import { formatDateTime, formatRelative } from '@/utils/formatDate'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

const schema = z.object({
  hosting_provider: z.string().min(1),
  server_ip: z.string().optional(),
  production_url: z.string().optional(),
  deployed_at: z.string().min(1, 'Deployment time is required'),
  status: z.string().min(1),
  notes: z.string().optional(),
})

type DeployForm = z.infer<typeof schema>

const statusDotColors: Record<string, string> = {
  success: 'bg-primary',
  failed: 'bg-danger',
  pending: 'bg-warning',
  rollback: 'bg-orange-400',
}

interface DeploymentTrackerProps {
  projectId: string
}

export function DeploymentTracker({ projectId }: DeploymentTrackerProps) {
  const { project, createDeployment, updateDeployment, deleteDeployment, isLoading } = useProject(projectId)
  const [createOpen, setCreateOpen] = useState(false)
  const [editDep, setEditDep] = useState<Deployment | null>(null)
  const [deleteDep, setDeleteDep] = useState<Deployment | null>(null)

  const deployments = (project?.deployments ?? []).sort(
    (a, b) => new Date(b.deployed_at).getTime() - new Date(a.deployed_at).getTime()
  )

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DeployForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      hosting_provider: 'Vercel',
      status: 'success',
      deployed_at: new Date().toISOString().slice(0, 16),
    },
  })

  const handleCreate = async (data: DeployForm) => {
    try {
      await createDeployment(data)
      toast.success('Deployment logged!')
      setCreateOpen(false)
      reset()
    } catch { toast.error('Failed to log deployment') }
  }

  const handleEdit = async (data: DeployForm) => {
    if (!editDep) return
    try {
      await updateDeployment({ depId: editDep.id, data })
      toast.success('Deployment updated!')
      setEditDep(null)
      reset()
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async () => {
    if (!deleteDep) return
    try {
      await deleteDeployment(deleteDep.id)
      toast.success('Deployment removed')
      setDeleteDep(null)
    } catch { toast.error('Failed to delete') }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-white/[0.06]" />
              <div className="w-0.5 h-16 bg-white/[0.04] mt-1" />
            </div>
            <div className="glass-card p-4 flex-1 mb-4">
              <div className="h-4 bg-white/[0.06] rounded w-1/3 mb-2" />
              <div className="h-3 bg-white/[0.04] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted">{deployments.length} deployment{deployments.length !== 1 ? 's' : ''}</p>
        <Button onClick={() => { reset({ hosting_provider: 'Vercel', status: 'success', deployed_at: new Date().toISOString().slice(0, 16) }); setCreateOpen(true) }} iconLeft={<Plus className="w-4 h-4" />}>
          Log Deployment
        </Button>
      </div>

      {deployments.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Rocket className="w-8 h-8 text-muted mx-auto mb-3 opacity-50" />
          <p className="text-white font-medium mb-1">No deployments logged</p>
          <p className="text-muted text-sm">Track your production and staging deployments.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[5px] top-0 bottom-0 w-0.5 bg-white/[0.06]" />

          <div className="space-y-6 pl-8">
            {deployments.map((dep, idx) => {
              const dotColor = statusDotColors[dep.status] || 'bg-gray-400'
              const statusConfig = DEPLOYMENT_STATUSES.find((s) => s.value === dep.status)
              return (
                <motion.div
                  key={dep.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="relative group"
                >
                  {/* Timeline dot */}
                  <div className={clsx('absolute -left-8 top-4 w-3 h-3 rounded-full border-2 border-background', dotColor)} />

                  <div className="glass-card p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-white">{dep.hosting_provider}</span>
                          <span className={clsx('text-xs font-medium', statusConfig?.color)}>
                            {statusConfig?.label || dep.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted">{formatDateTime(dep.deployed_at)}</p>
                        <p className="text-xs text-muted mt-0.5">{formatRelative(dep.deployed_at)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditDep(dep)
                            setValue('hosting_provider', dep.hosting_provider)
                            setValue('server_ip', dep.server_ip ?? '')
                            setValue('production_url', dep.production_url ?? '')
                            setValue('deployed_at', dep.deployed_at.slice(0, 16))
                            setValue('status', dep.status)
                            setValue('notes', dep.notes ?? '')
                          }}
                          className="p-1.5 rounded text-muted hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteDep(dep)} className="p-1.5 rounded text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {dep.production_url && (
                        <a
                          href={dep.production_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {dep.production_url}
                        </a>
                      )}
                      {dep.server_ip && (
                        <p className="text-xs text-muted mono">Server: {dep.server_ip}</p>
                      )}
                      {dep.notes && (
                        <p className="text-xs text-muted mt-2 italic">{dep.notes}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Create/Edit Modals */}
      {[
        { isOpen: createOpen, onClose: () => { setCreateOpen(false); reset() }, onSubmit: handleCreate, title: 'Log Deployment' },
        { isOpen: !!editDep, onClose: () => { setEditDep(null); reset() }, onSubmit: handleEdit, title: 'Edit Deployment' },
      ].map((modal) => (
        <Modal key={modal.title} isOpen={modal.isOpen} onClose={modal.onClose} title={modal.title} size="md">
          <form onSubmit={handleSubmit(modal.onSubmit)} className="space-y-4">
            <Select label="Hosting Provider" {...register('hosting_provider')}>
              {HOSTING_PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Input label="Deployed At *" type="datetime-local" error={errors.deployed_at?.message} {...register('deployed_at')} />
            <Select label="Status" {...register('status')}>
              {DEPLOYMENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
            <Input label="Production URL" placeholder="https://..." {...register('production_url')} />
            <Input label="Server IP" placeholder="123.456.789.0" {...register('server_ip')} />
            <Textarea label="Notes" placeholder="What changed in this deployment..." rows={3} {...register('notes')} />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={modal.onClose}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Modal>
      ))}

      <ConfirmModal
        isOpen={!!deleteDep}
        onClose={() => setDeleteDep(null)}
        onConfirm={handleDelete}
        title="Remove Deployment"
        message="Remove this deployment log?"
        confirmLabel="Remove"
        dangerous
      />
    </>
  )
}
