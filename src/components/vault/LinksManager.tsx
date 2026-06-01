'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link as LinkIcon, Plus, ExternalLink, Copy, Pencil, Trash2, Check, Search } from 'lucide-react'
import { useProject } from '@/hooks/useProject'
import { ProjectLink } from '@/types'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { LINK_CATEGORIES } from '@/utils/constants'
import { copyToClipboard } from '@/utils/copyToClipboard'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const linkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Must be a valid URL'),
  category: z.string().min(1),
  description: z.string().optional(),
})

type LinkForm = z.infer<typeof linkSchema>

interface LinksManagerProps {
  projectId: string
}

export function LinksManager({ projectId }: LinksManagerProps) {
  const { project, createLink, updateLink, deleteLink, isLoading } = useProject(projectId)
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editLink, setEditLink] = useState<ProjectLink | null>(null)
  const [deleteLink_, setDeleteLink] = useState<ProjectLink | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const links = project?.links ?? []

  const filtered = links.filter((l) => {
    const matchCat = activeCategory === 'ALL' || l.category === activeCategory
    const matchSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.url.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<LinkForm>({
    resolver: zodResolver(linkSchema),
    defaultValues: { category: 'OTHER' },
  })

  const handleCopy = useCallback(async (link: ProjectLink) => {
    await copyToClipboard(link.url)
    setCopiedId(link.id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const handleCreate = async (data: LinkForm) => {
    try {
      await createLink(data)
      toast.success('Link added!')
      setCreateOpen(false)
      reset()
    } catch { toast.error('Failed to add link') }
  }

  const handleEdit = async (data: LinkForm) => {
    if (!editLink) return
    try {
      await updateLink({ linkId: editLink.id, data })
      toast.success('Link updated!')
      setEditLink(null)
      reset()
    } catch { toast.error('Failed to update link') }
  }

  const handleDelete = async () => {
    if (!deleteLink_) return
    try {
      await deleteLink(deleteLink_.id)
      toast.success('Link deleted')
      setDeleteLink(null)
    } catch { toast.error('Failed to delete') }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-4 animate-pulse flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/[0.06]" />
            <div className="flex-1">
              <div className="h-4 bg-white/[0.06] rounded w-1/3 mb-1.5" />
              <div className="h-3 bg-white/[0.04] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-10"
          />
        </div>
        <Button onClick={() => { reset({ category: 'OTHER' }); setCreateOpen(true) }} iconLeft={<Plus className="w-4 h-4" />}>
          Add Link
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={clsx(
            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border',
            activeCategory === 'ALL'
              ? 'bg-primary/20 text-primary border-primary/30'
              : 'bg-white/5 text-muted border-white/[0.06] hover:text-white'
          )}
        >
          All ({links.length})
        </button>
        {LINK_CATEGORIES.map((cat) => {
          const count = links.filter((l) => l.category === cat.value).length
          if (count === 0) return null
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border',
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

      {/* Links grid */}
      {filtered.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <LinkIcon className="w-8 h-8 text-muted mx-auto mb-3 opacity-50" />
          <p className="text-white font-medium mb-1">No links yet</p>
          <p className="text-muted text-sm">Add useful URLs, repos, docs, and more.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((link) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 flex gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                <LinkIcon className="w-4 h-4 text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{link.title}</p>
                    <p className="text-xs text-muted truncate mt-0.5">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => handleCopy(link)}
                      className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-muted hover:text-secondary hover:bg-secondary/10 transition-colors"
                      title="Open"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => {
                        setEditLink(link)
                        setValue('title', link.title)
                        setValue('url', link.url)
                        setValue('category', link.category)
                        setValue('description', link.description ?? '')
                      }}
                      className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteLink(link)}
                      className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {link.description && (
                  <p className="text-xs text-muted mt-1.5 line-clamp-1">{link.description}</p>
                )}
                <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted">
                  {LINK_CATEGORIES.find((c) => c.value === link.category)?.label || link.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => { setCreateOpen(false); reset() }} title="Add Link" size="md">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <Input label="Title *" placeholder="GitHub Repository" error={errors.title?.message} {...register('title')} />
          <Input label="URL *" placeholder="https://..." error={errors.url?.message} {...register('url')} />
          <Select label="Category" {...register('category')}>
            {LINK_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
          <Textarea label="Description" placeholder="Brief description..." rows={2} {...register('description')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setCreateOpen(false); reset() }}>Cancel</Button>
            <Button type="submit">Add Link</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editLink} onClose={() => { setEditLink(null); reset() }} title="Edit Link" size="md">
        <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
          <Input label="Title *" error={errors.title?.message} {...register('title')} />
          <Input label="URL *" error={errors.url?.message} {...register('url')} />
          <Select label="Category" {...register('category')}>
            {LINK_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
          <Textarea label="Description" rows={2} {...register('description')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setEditLink(null); reset() }}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteLink_}
        onClose={() => setDeleteLink(null)}
        onConfirm={handleDelete}
        title="Delete Link"
        message={`Delete "${deleteLink_?.title}"?`}
        confirmLabel="Delete"
        dangerous
      />
    </>
  )
}
