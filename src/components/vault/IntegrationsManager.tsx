'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Blocks, Plus, Search, ExternalLink, BookOpen, Trash2, Edit2, 
  CreditCard, BrainCircuit, ShieldCheck, Mail, Database, Zap, X, Info
} from 'lucide-react'
import { useProject } from '@/hooks/useProject'
import { useAuth } from '@/hooks/useAuth'
import { ProjectIntegration } from '@/types'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/Modal'
import toast from 'react-hot-toast'

interface IntegrationsManagerProps {
  projectId: string
}

const CATEGORIES = [
  { value: 'PAYMENTS', label: 'Payments', icon: CreditCard, color: 'text-emerald-400 bg-emerald-500/10' },
  { value: 'AI', label: 'Artificial Intelligence', icon: BrainCircuit, color: 'text-violet-400 bg-violet-500/10' },
  { value: 'AUTH', label: 'Authentication', icon: ShieldCheck, color: 'text-blue-400 bg-blue-500/10' },
  { value: 'MAILING', label: 'Mailing / CRM', icon: Mail, color: 'text-amber-400 bg-amber-500/10' },
  { value: 'DATABASE', label: 'Database / Cache', icon: Database, color: 'text-purple-400 bg-purple-500/10' },
  { value: 'OTHER', label: 'Other Service', icon: Zap, color: 'text-pink-400 bg-pink-500/10' }
]

const STATUSES = [
  { value: 'ACTIVE', label: 'Active', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'TESTING', label: 'Testing', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'PLANNED', label: 'Planned', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  { value: 'DEPRECATED', label: 'Deprecated', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' }
]

export function IntegrationsManager({ projectId }: IntegrationsManagerProps) {
  const { user } = useAuth()
  const { project, createIntegration, updateIntegration, deleteIntegration } = useProject(projectId)
  const integrations = project?.integrations || []

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ProjectIntegration | null>(null)
  
  // Form fields
  const [name, setName] = useState('')
  const [category, setCategory] = useState('PAYMENTS')
  const [status, setStatus] = useState('ACTIVE')
  const [url, setUrl] = useState('')
  const [apiDocUrl, setApiDocUrl] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  
  // Deleting item
  const [deletingItem, setDeletingItem] = useState<ProjectIntegration | null>(null)

  const handleOpenCreate = () => {
    if (user?.is_guest) return
    setEditingItem(null)
    setName('')
    setCategory('PAYMENTS')
    setStatus('ACTIVE')
    setUrl('')
    setApiDocUrl('')
    setDescription('')
    setModalOpen(true)
  }

  const handleOpenEdit = (item: ProjectIntegration) => {
    if (user?.is_guest) return
    setEditingItem(item)
    setName(item.name)
    setCategory(item.category)
    setStatus(item.status)
    setUrl(item.url || '')
    setApiDocUrl(item.api_doc_url || '')
    setDescription(item.description || '')
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user?.is_guest) return
    if (!name.trim()) {
      toast.error('Integration name is required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name,
        category,
        status,
        url: url.trim() || null,
        api_doc_url: apiDocUrl.trim() || null,
        description: description.trim() || null,
      }

      if (editingItem) {
        await updateIntegration({ itemId: editingItem.id, data: payload })
        toast.success('Integration updated successfully!')
      } else {
        await createIntegration(payload)
        toast.success('Integration added successfully!')
      }
      setModalOpen(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to save integration')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingItem || user?.is_guest) return
    try {
      await deleteIntegration(deletingItem.id)
      toast.success('Integration removed')
      setDeletingItem(null)
    } catch {
      toast.error('Failed to delete integration')
    }
  }

  const filtered = integrations
    .filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter
      return matchSearch && matchCategory
    })

  const getCategoryDetails = (catVal: string) => {
    return CATEGORIES.find((c) => c.value === catVal) || { icon: Zap, label: catVal, color: 'text-muted bg-white/5' }
  }

  const getStatusDetails = (statusVal: string) => {
    return STATUSES.find((s) => s.value === statusVal) || { label: statusVal, color: 'bg-white/5 text-muted' }
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Blocks className="w-5 h-5 text-primary" /> Integrations & Services Vault
          </h2>
          <p className="text-muted text-sm mt-1">
            Keep track of external APIs, dashboards, databases, and document libraries integrated with this project.
          </p>
        </div>
        {!user?.is_guest && (
          <Button onClick={handleOpenCreate} iconLeft={<Plus className="w-4 h-4" />}>
            Register Service
          </Button>
        )}
      </div>

      {/* Filter / Search panel */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search field */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search registered services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-10"
          />
        </div>

        {/* Category filtering */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-dark w-full sm:w-[200px]"
        >
          <option value="ALL">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Services Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-card p-12 text-center"
          >
            <Blocks className="w-12 h-12 text-muted/40 mx-auto mb-4" />
            <p className="text-white font-medium">No services found</p>
            <p className="text-muted text-sm mt-1 mb-4">
              {search || categoryFilter !== 'ALL'
                ? 'Try adjusting your search query or filters'
                : 'Register third-party APIs like Stripe, Sentry, or OpenAI to keep resources aligned.'}
            </p>
            {!user?.is_guest && !search && categoryFilter === 'ALL' && (
              <Button onClick={handleOpenCreate} size="sm">Register Your First Integration</Button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((item) => {
              const catInfo = getCategoryDetails(item.category)
              const CatIcon = catInfo.icon
              const statInfo = getStatusDetails(item.status)

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card p-5 flex flex-col justify-between hover:border-white/[0.12] transition-colors relative group"
                >
                  <div className="space-y-3">
                    {/* Badge and options header */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full border ${statInfo.color}`}>
                        {statInfo.label}
                      </span>
                      
                      {/* Action buttons (Admin only) */}
                      {!user?.is_guest && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 rounded text-muted hover:text-white hover:bg-white/5 transition-colors"
                            title="Edit Service"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-1 rounded text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                            title="Remove Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Logo/Name */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${catInfo.color}`}>
                        <CatIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold truncate text-base">{item.name}</h3>
                        <p className="text-[11px] text-muted tracking-tight">{catInfo.label}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-white/70 text-sm leading-relaxed min-h-[40px] line-clamp-3">
                      {item.description || 'No description provided for this service integration.'}
                    </p>
                  </div>

                  {/* Footer link/launch indicators */}
                  <div className="flex gap-2 pt-4 mt-4 border-t border-white/[0.04] text-xs">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-primary" /> Console
                      </a>
                    ) : (
                      <span className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.02] text-muted/40 cursor-not-allowed select-none">
                        No Dashboard
                      </span>
                    )}

                    {item.api_doc_url ? (
                      <a
                        href={item.api_doc_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-sky-400" /> Docs
                      </a>
                    ) : (
                      <span className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.02] text-muted/40 cursor-not-allowed select-none">
                        No Docs
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Register/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => !saving && setModalOpen(false)}
            />

            {/* Content card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-lg bg-[#161E2E] border border-white/[0.08] rounded-2xl shadow-modal overflow-hidden p-6"
            >
              {/* Close Button */}
              <button
                disabled={saving}
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-white mb-4">
                {editingItem ? 'Edit Service Integration' : 'Register Third-Party Service'}
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Service Name */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Service / API Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, OpenAI, Clerk, AWS S3"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-dark"
                  />
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Service Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="input-dark"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Integration Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="input-dark"
                    >
                      {STATUSES.map((stat) => (
                        <option key={stat.value} value={stat.value}>
                          {stat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* URLs */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Dashboard Console URL
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://dashboard.stripe.com/"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="input-dark text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    API Reference / Docs URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://docs.stripe.com/api"
                    value={apiDocUrl}
                    onChange={(e) => setApiDocUrl(e.target.value)}
                    className="input-dark text-sm"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Service Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Document API keys layout, sandbox links, or setup configuration..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-dark resize-none"
                  />
                </div>

                {/* Submit actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.04]">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setModalOpen(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={saving}>
                    {editingItem ? 'Save Integration' : 'Register Service'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Remove Integration"
        message={`Are you sure you want to unregister "${deletingItem?.name}" from this project?`}
        confirmLabel="Remove Service"
        dangerous
      />
    </div>
  )
}
