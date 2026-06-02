'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Calendar, ClipboardList, AlertCircle, Play, CheckCircle2, Search } from 'lucide-react'
import { useProject } from '@/hooks/useProject'
import { RoadmapItem } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { useForm } from 'react-hook-form'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

const COLUMNS = [
  { id: 'PLANNED', label: 'Planned', color: 'text-sky-400 border-sky-500/20 bg-sky-500/[0.02]', icon: ClipboardList },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'text-amber-400 border-amber-500/20 bg-amber-500/[0.02]', icon: Play },
  { id: 'COMPLETED', label: 'Completed', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.02]', icon: CheckCircle2 },
  { id: 'BLOCKED', label: 'Blocked', color: 'text-rose-400 border-rose-500/20 bg-rose-500/[0.02]', icon: AlertCircle },
]

const PRIORITIES = [
  { value: 'LOW', label: 'Low', class: 'bg-white/10 text-muted border-white/[0.06]' },
  { value: 'MEDIUM', label: 'Medium', class: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { value: 'HIGH', label: 'High', class: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
]

interface RoadmapManagerProps {
  projectId: string
}

interface ItemForm {
  title: string
  description?: string
  status: string
  priority: string
  target_date?: string
}

export function RoadmapManager({ projectId }: RoadmapManagerProps) {
  const { user } = useAuth()
  const { project, createRoadmapItem, updateRoadmapItem, deleteRoadmapItem, isLoading } = useProject(projectId)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<RoadmapItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<RoadmapItem | null>(null)

  const items = project?.roadmap ?? []
  const filtered = items.filter((item) => {
    return !search || item.title.toLowerCase().includes(search.toLowerCase()) || (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ItemForm>({
    defaultValues: { status: 'PLANNED', priority: 'MEDIUM' },
  })

  const handleCreate = async (data: ItemForm) => {
    try {
      await createRoadmapItem(data)
      toast.success('Roadmap item created!')
      setCreateOpen(false)
      reset()
    } catch {
      toast.error('Failed to create item')
    }
  }

  const handleEdit = async (data: ItemForm) => {
    if (!editItem) return
    try {
      await updateRoadmapItem({ itemId: editItem.id, data })
      toast.success('Roadmap item updated!')
      setEditItem(null)
      reset()
    } catch {
      toast.error('Failed to update item')
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      await deleteRoadmapItem(deleteItem.id)
      toast.success('Roadmap item deleted!')
      setDeleteItem(null)
    } catch {
      toast.error('Failed to delete item')
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {COLUMNS.map((col) => (
          <div key={col.id} className="glass-card p-4 h-[400px]">
            <div className="h-6 bg-white/[0.06] rounded w-1/2 mb-4" />
            <div className="h-[120px] bg-white/[0.04] rounded-lg mb-3" />
            <div className="h-[120px] bg-white/[0.04] rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-10"
          />
        </div>
        {!user?.is_guest && (
          <Button onClick={() => { reset({ status: 'PLANNED', priority: 'MEDIUM' }); setCreateOpen(true) }} iconLeft={<Plus className="w-4 h-4" />}>
            Add Task / Feature
          </Button>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {COLUMNS.map((col) => {
          const colItems = filtered.filter((i) => i.status === col.id)
          const ColIcon = col.icon

          return (
            <div key={col.id} className="flex flex-col h-full min-h-[500px]">
              {/* Column Title Banner */}
              <div className={clsx('flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/[0.05] font-semibold text-sm mb-4 select-none', col.color)}>
                <div className="flex items-center gap-2">
                  <ColIcon className="w-4 h-4" />
                  <span>{col.label}</span>
                </div>
                <span className="text-xs bg-white/5 border border-white/[0.06] rounded-full px-2 py-0.5 text-white/80">
                  {colItems.length}
                </span>
              </div>

              {/* Items Card List */}
              <div className="flex-1 flex flex-col gap-3 rounded-2xl bg-black/20 border border-white/[0.04] p-3 overflow-y-auto max-h-[600px] scrollbar-none">
                <AnimatePresence>
                  {colItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none opacity-40">
                      <ColIcon className="w-6 h-6 text-muted mb-2" />
                      <p className="text-xs text-muted">No items</p>
                    </div>
                  ) : (
                    colItems.map((item) => {
                      const priorityConfig = PRIORITIES.find((p) => p.value === item.priority)
                      return (
                        <motion.div
                          key={item.id}
                          layoutId={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="glass-card p-4 group cursor-pointer border border-white/[0.06] hover:border-white/[0.15] transition-all relative"
                          onClick={() => {
                            if (!user?.is_guest) {
                              setEditItem(item)
                              setValue('title', item.title)
                              setValue('description', item.description ?? '')
                              setValue('status', item.status)
                              setValue('priority', item.priority)
                              setValue('target_date', item.target_date ?? '')
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="text-sm font-semibold text-white/95 leading-snug group-hover:text-primary transition-colors truncate flex-1">
                              {item.title}
                            </h4>
                            {!user?.is_guest && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteItem(item)
                                }}
                                className="p-1 rounded text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {item.description && (
                            <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-3">
                              {item.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.04]">
                            {priorityConfig && (
                              <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border font-medium select-none', priorityConfig.class)}>
                                {priorityConfig.label}
                              </span>
                            )}
                            {item.target_date && (
                              <span className="text-[10px] text-muted flex items-center gap-1 ml-auto">
                                <Calendar className="w-3 h-3" />
                                {item.target_date}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => { setCreateOpen(false); reset() }} title="Add Roadmap Item" size="md">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <Input label="Task Title *" placeholder="Add user auth flow" error={errors.title?.message} {...register('title', { required: 'Title is required' })} />
          <Textarea label="Description" placeholder="What needs to be done? Include specs or details." rows={3} {...register('description')} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" {...register('status')}>
              {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
            <Select label="Priority" {...register('priority')}>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </Select>
          </div>
          <Input label="Target Date / Release" type="text" placeholder="e.g. Q3 2026, June 15" {...register('target_date')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setCreateOpen(false); reset() }}>Cancel</Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editItem} onClose={() => { setEditItem(null); reset() }} title="Edit Roadmap Item" size="md">
        <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
          <Input label="Task Title *" error={errors.title?.message} {...register('title', { required: 'Title is required' })} />
          <Textarea label="Description" rows={3} {...register('description')} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" {...register('status')}>
              {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
            <Select label="Priority" {...register('priority')}>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </Select>
          </div>
          <Input label="Target Date / Release" type="text" placeholder="e.g. Q3 2026, June 15" {...register('target_date')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setEditItem(null); reset() }}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Roadmap Item"
        message={`Delete "${deleteItem?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        dangerous
      />
    </>
  )
}
