'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Lock, Plus, Eye, EyeOff, Copy, Check, Pencil, Trash2, Search, ShieldAlert } from 'lucide-react'
import { useProject } from '@/hooks/useProject'
import { Credential } from '@/types'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { CREDENTIAL_TYPES } from '@/utils/constants'
import { copyToClipboard } from '@/utils/copyToClipboard'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'
import axios from 'axios'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.string().min(1),
  username: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
  description: z.string().optional(),
})

type CredForm = z.infer<typeof schema>

interface CredentialsVaultProps {
  projectId: string
}

function PasswordStrength({ password }: { password: string }) {
  const len = password.length
  const strength = len === 0 ? 0 : len < 8 ? 1 : len < 16 ? 2 : 3
  const labels = ['', 'Weak', 'Good', 'Strong']
  const colors = ['', 'bg-danger', 'bg-warning', 'bg-success']
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={clsx('h-1 flex-1 rounded-full transition-colors', i <= strength ? colors[strength] : 'bg-white/10')} />
        ))}
      </div>
      {strength > 0 && <span className="text-xs text-muted">{labels[strength]}</span>}
    </div>
  )
}

export function CredentialsVault({ projectId }: CredentialsVaultProps) {
  const { project, createCredential, updateCredential, deleteCredential, isLoading } = useProject(projectId)
  const [activeType, setActiveType] = useState('ALL')
  const [search, setSearch] = useState('')
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({})
  const [showingIds, setShowingIds] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editCred, setEditCred] = useState<Credential | null>(null)
  const [deleteCred, setDeleteCred] = useState<Credential | null>(null)
  const [passwordInput, setPasswordInput] = useState('')

  const credentials = project?.credentials ?? []
  const filtered = credentials.filter((c) => {
    const matchType = activeType === 'ALL' || c.type === activeType
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CredForm>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'DATABASE' },
  })

  const watchPassword = watch('password', '')

  const toggleReveal = useCallback(async (cred: Credential) => {
    const isShowing = showingIds.has(cred.id)
    if (isShowing) {
      setShowingIds((prev) => { const n = new Set(prev); n.delete(cred.id); return n })
      return
    }

    // If already fetched
    if (revealedPasswords[cred.id]) {
      setShowingIds((prev) => new Set([...prev, cred.id]))
      return
    }

    try {
      const { data } = await axios.get<{ password: string }>(`/api/credentials/${cred.id}?reveal=true`)
      setRevealedPasswords((prev) => ({ ...prev, [cred.id]: data.password }))
      setShowingIds((prev) => new Set([...prev, cred.id]))
    } catch { toast.error('Failed to reveal password') }
  }, [revealedPasswords, showingIds])

  const handleCopyPassword = useCallback(async (cred: Credential) => {
    let pwd = revealedPasswords[cred.id]
    if (!pwd) {
      try {
        const { data } = await axios.get<{ password: string }>(`/api/credentials/${cred.id}?reveal=true`)
        pwd = data.password
        setRevealedPasswords((prev) => ({ ...prev, [cred.id]: data.password }))
      } catch { toast.error('Failed to copy password'); return }
    }
    await copyToClipboard(pwd, 'Password copied!')
    setCopiedId(cred.id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [revealedPasswords])

  const handleCreate = async (data: CredForm) => {
    try {
      await createCredential(data)
      toast.success('Credential added!')
      setCreateOpen(false)
      reset()
      setPasswordInput('')
    } catch { toast.error('Failed to add credential') }
  }

  const handleEdit = async (data: CredForm) => {
    if (!editCred) return
    try {
      await updateCredential({ credId: editCred.id, data })
      toast.success('Credential updated!')
      setEditCred(null)
      reset()
    } catch { toast.error('Failed to update credential') }
  }

  const handleDelete = async () => {
    if (!deleteCred) return
    try {
      await deleteCredential(deleteCred.id)
      toast.success('Credential deleted')
      setDeleteCred(null)
    } catch { toast.error('Failed to delete') }
  }

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="h-4 bg-white/[0.06] rounded w-1/4 mb-3" />
            <div className="h-3 bg-white/[0.04] rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Security banner */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/[0.08] border border-warning/20 mb-5">
        <ShieldAlert className="w-5 h-5 text-warning shrink-0" />
        <p className="text-xs text-warning/90">
          Credentials are AES-encrypted at rest. Passwords are never stored in plaintext.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" placeholder="Search credentials..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-dark pl-10" />
        </div>
        <Button onClick={() => { reset({ type: 'DATABASE' }); setCreateOpen(true) }} iconLeft={<Plus className="w-4 h-4" />}>
          Add Credential
        </Button>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        {['ALL', ...CREDENTIAL_TYPES.map((t) => t.value)].map((type) => {
          const count = type === 'ALL' ? credentials.length : credentials.filter((c) => c.type === type).length
          if (type !== 'ALL' && count === 0) return null
          const label = type === 'ALL' ? 'All' : CREDENTIAL_TYPES.find((t) => t.value === type)?.label || type
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors',
                activeType === type
                  ? 'bg-primary/20 text-primary border-primary/30'
                  : 'bg-white/5 text-muted border-white/[0.06] hover:text-white'
              )}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Lock className="w-8 h-8 text-muted mx-auto mb-3 opacity-50" />
          <p className="text-white font-medium mb-1">No credentials yet</p>
          <p className="text-muted text-sm">Store passwords and API keys securely.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((cred) => {
            const typeConfig = CREDENTIAL_TYPES.find((t) => t.value === cred.type)
            const isShowing = showingIds.has(cred.id)
            const revealed = revealedPasswords[cred.id]
            return (
              <motion.div
                key={cred.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{cred.title}</p>
                    {cred.description && <p className="text-xs text-muted mt-0.5">{cred.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditCred(cred); setValue('title', cred.title); setValue('type', cred.type); setValue('username', cred.username ?? ''); setValue('password', ''); setValue('description', cred.description ?? '') }}
                      className="p-1.5 rounded text-muted hover:text-white hover:bg-white/5 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteCred(cred)} className="p-1.5 rounded text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {typeConfig && (
                  <span className={clsx('inline-block mb-3 text-[10px] px-2 py-0.5 rounded-full border font-medium', typeConfig.color)}>
                    {typeConfig.label}
                  </span>
                )}

                <div className="space-y-2">
                  {cred.username && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">Username</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-white mono">{cred.username}</span>
                        <button onClick={() => copyToClipboard(cred.username!, 'Username copied!')} className="p-1 rounded text-muted hover:text-primary transition-colors">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">Password</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-white mono">
                        {isShowing && revealed ? revealed : '●'.repeat(12)}
                      </span>
                      <button onClick={() => toggleReveal(cred)} className="p-1 rounded text-muted hover:text-white transition-colors" title={isShowing ? 'Hide' : 'Reveal'}>
                        {isShowing ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button onClick={() => handleCopyPassword(cred)} className="p-1 rounded text-muted hover:text-primary transition-colors">
                        {copiedId === cred.id ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => { setCreateOpen(false); reset(); setPasswordInput('') }} title="Add Credential" size="md">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <Input label="Title *" placeholder="Production DB" error={errors.title?.message} {...register('title')} />
          <Select label="Type" {...register('type')}>
            {CREDENTIAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <Input label="Username" placeholder="admin" {...register('username')} />
          <div>
            <Input label="Password *" type="password" error={errors.password?.message} {...register('password', { onChange: (e) => setPasswordInput(e.target.value) })} />
            <PasswordStrength password={passwordInput} />
          </div>
          <Textarea label="Description" rows={2} {...register('description')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setCreateOpen(false); reset(); setPasswordInput('') }}>Cancel</Button>
            <Button type="submit">Save Credential</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editCred} onClose={() => { setEditCred(null); reset() }} title="Edit Credential" size="md">
        <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
          <Input label="Title *" error={errors.title?.message} {...register('title')} />
          <Select label="Type" {...register('type')}>
            {CREDENTIAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <Input label="Username" {...register('username')} />
          <Input label="New Password (leave blank to keep existing)" type="password" {...register('password')} />
          <Textarea label="Description" rows={2} {...register('description')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setEditCred(null); reset() }}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteCred}
        onClose={() => setDeleteCred(null)}
        onConfirm={handleDelete}
        title="Delete Credential"
        message={`Delete "${deleteCred?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        dangerous
      />
    </>
  )
}
