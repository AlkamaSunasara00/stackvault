'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Plus, Copy, Check, Pencil, Trash2, Search } from 'lucide-react'
import { useProject } from '@/hooks/useProject'
import { ProjectCommand } from '@/types'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { COMMAND_CATEGORIES } from '@/utils/constants'
import { copyToClipboard } from '@/utils/copyToClipboard'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  command: z.string().min(1, 'Command is required'),
  category: z.string().min(1),
  description: z.string().optional(),
})

type CommandForm = z.infer<typeof schema>

interface CommandsVaultProps {
  projectId: string
}

function highlightCommand(cmd: string): React.ReactNode {
  const parts = cmd.split(/(\s+)/)
  return parts.map((part, i) => {
    if (i === 0) return <span key={i} className="text-primary font-semibold">{part}</span>
    if (part.startsWith('--') || part.startsWith('-')) return <span key={i} className="text-warning">{part}</span>
    if (part.startsWith('$')) return <span key={i} className="text-secondary">{part}</span>
    return <span key={i} className="text-white/80">{part}</span>
  })
}

export function CommandsVault({ projectId }: CommandsVaultProps) {
  const { project, createCommand, updateCommand, deleteCommand, isLoading } = useProject(projectId)
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editCmd, setEditCmd] = useState<ProjectCommand | null>(null)
  const [deleteCmd, setDeleteCmd] = useState<ProjectCommand | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const commands = project?.commands ?? []
  const filtered = commands.filter((c) => {
    const matchCat = activeCategory === 'ALL' || c.category === activeCategory
    const matchSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.command.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CommandForm>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'OTHER' },
  })

  const handleCopy = useCallback(async (cmd: ProjectCommand) => {
    await copyToClipboard(cmd.command, 'Command copied!')
    setCopiedId(cmd.id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const handleCreate = async (data: CommandForm) => {
    try {
      await createCommand(data)
      toast.success('Command added!')
      setCreateOpen(false)
      reset()
    } catch { toast.error('Failed to add command') }
  }

  const handleEdit = async (data: CommandForm) => {
    if (!editCmd) return
    try {
      await updateCommand({ commandId: editCmd.id, data })
      toast.success('Command updated!')
      setEditCmd(null)
      reset()
    } catch { toast.error('Failed to update command') }
  }

  const handleDelete = async () => {
    if (!deleteCmd) return
    try {
      await deleteCommand(deleteCmd.id)
      toast.success('Command deleted')
      setDeleteCmd(null)
    } catch { toast.error('Failed to delete') }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-4 animate-pulse">
            <div className="h-4 bg-white/[0.06] rounded w-1/4 mb-3" />
            <div className="bg-black/40 rounded-lg p-3">
              <div className="h-3 bg-white/[0.04] rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-10"
          />
        </div>
        <Button onClick={() => { reset({ category: 'OTHER' }); setCreateOpen(true) }} iconLeft={<Plus className="w-4 h-4" />}>
          Add Command
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={clsx(
            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors',
            activeCategory === 'ALL'
              ? 'bg-primary/20 text-primary border-primary/30'
              : 'bg-white/5 text-muted border-white/[0.06] hover:text-white'
          )}
        >
          All ({commands.length})
        </button>
        {COMMAND_CATEGORIES.map((cat) => {
          const count = commands.filter((c) => c.category === cat.value).length
          if (count === 0) return null
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors',
                activeCategory === cat.value
                  ? 'bg-primary/20 text-primary border-primary/30'
                  : 'bg-white/5 text-muted border-white/[0.06] hover:text-white'
              )}
            >
              {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Terminal className="w-8 h-8 text-muted mx-auto mb-3 opacity-50" />
          <p className="text-white font-medium mb-1">No commands yet</p>
          <p className="text-muted text-sm">Save frequently used commands and scripts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((cmd) => {
            const catConfig = COMMAND_CATEGORIES.find((c) => c.value === cmd.category)
            return (
              <motion.div
                key={cmd.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{cmd.title}</p>
                    {cmd.description && (
                      <p className="text-xs text-muted mt-0.5">{cmd.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditCmd(cmd); setValue('title', cmd.title); setValue('command', cmd.command); setValue('category', cmd.category); setValue('description', cmd.description ?? '') }}
                      className="p-1.5 rounded text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteCmd(cmd)} className="p-1.5 rounded text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-black/40 rounded-lg border border-white/[0.06] p-3 mb-3 mono text-xs leading-relaxed">
                  {highlightCommand(cmd.command)}
                </div>

                <div className="flex items-center justify-between">
                  {catConfig && (
                    <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border font-medium', catConfig.color)}>
                      {catConfig.label}
                    </span>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopy(cmd)}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      copiedId === cmd.id
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-white/5 text-muted hover:text-white hover:bg-white/10 border border-white/[0.06]'
                    )}
                  >
                    {copiedId === cmd.id ? (
                      <><Check className="w-3.5 h-3.5" /> Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy</>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <Modal isOpen={createOpen} onClose={() => { setCreateOpen(false); reset() }} title="Add Command" size="md">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <Input label="Title *" placeholder="Start dev server" error={errors.title?.message} {...register('title')} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/90">Command *</label>
            <textarea
              placeholder="npm run dev"
              className={clsx('input-dark mono resize-none min-h-[80px]', errors.command && 'border-danger/50')}
              {...register('command')}
            />
            {errors.command && <p className="text-xs text-danger">{errors.command.message}</p>}
          </div>
          <Select label="Category" {...register('category')}>
            {COMMAND_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
          <Textarea label="Description" rows={2} {...register('description')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setCreateOpen(false); reset() }}>Cancel</Button>
            <Button type="submit">Add Command</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editCmd} onClose={() => { setEditCmd(null); reset() }} title="Edit Command" size="md">
        <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
          <Input label="Title *" {...register('title')} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/90">Command *</label>
            <textarea className="input-dark mono resize-none min-h-[80px]" {...register('command')} />
          </div>
          <Select label="Category" {...register('category')}>
            {COMMAND_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
          <Textarea label="Description" rows={2} {...register('description')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setEditCmd(null); reset() }}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteCmd}
        onClose={() => setDeleteCmd(null)}
        onConfirm={handleDelete}
        title="Delete Command"
        message={`Delete "${deleteCmd?.title}"?`}
        confirmLabel="Delete"
        dangerous
      />
    </>
  )
}
