'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Eye, EyeOff, Copy, Check, Trash2, Pencil, FileCode, Search, ClipboardList, Info } from 'lucide-react'
import { useProject } from '@/hooks/useProject'
import { useAuth } from '@/hooks/useAuth'
import { Environment, EnvironmentVariable } from '@/types'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { copyToClipboard } from '@/utils/copyToClipboard'
import { useForm } from 'react-hook-form'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

const ENV_TABS = ['LOCAL', 'DEVELOPMENT', 'STAGING', 'PRODUCTION']

interface EnvManagerProps {
  projectId: string
}

export function EnvManager({ projectId }: EnvManagerProps) {
  const { user } = useAuth()
  const { project, createEnvironment, createEnvVariable, createEnvVariablesBulk, updateEnvVariable, deleteEnvVariable, isLoading } = useProject(projectId)
  const [activeTab, setActiveTab] = useState('LOCAL')
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [addVarOpen, setAddVarOpen] = useState(false)
  const [editVar, setEditVar] = useState<EnvironmentVariable | null>(null)
  const [deleteVar, setDeleteVar] = useState<EnvironmentVariable | null>(null)
  const [search, setSearch] = useState('')
  const [importEnvOpen, setImportEnvOpen] = useState(false)
  const [envRawText, setEnvRawText] = useState('')
  const [parsedVars, setParsedVars] = useState<Array<{ key: string; value: string; is_secret: boolean; selected: boolean; description: string }>>([])

  const parseEnvText = (text: string) => {
    const lines = text.split('\n')
    const vars: Array<{ key: string; value: string; is_secret: boolean; selected: boolean; description: string }> = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
        continue
      }
      
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      
      const key = trimmed.slice(0, eqIndex).trim()
      let value = trimmed.slice(eqIndex + 1).trim()
      
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      
      if (key) {
        vars.push({
          key,
          value,
          is_secret: true,
          selected: true,
          description: '',
        })
      }
    }
    setParsedVars(vars)
  }

  const handleImportEnv = async () => {
    await ensureEnvExists()
    const env = project?.environments?.find((e) => e.name === activeTab)
    const envId = env?.id || activeEnv?.id
    if (!envId) { toast.error('Create environment first'); return }
    
    const selectedVars = parsedVars.filter(v => v.selected)
    if (selectedVars.length === 0) {
      toast.error('No variables selected to import')
      return
    }
    
    try {
      await createEnvVariablesBulk({
        environment_id: envId,
        variables: selectedVars.map(v => ({
          key: v.key,
          value: v.value,
          is_secret: v.is_secret,
          description: v.description
        }))
      })
      toast.success(`Successfully imported ${selectedVars.length} variables!`)
      setImportEnvOpen(false)
      setEnvRawText('')
      setParsedVars([])
    } catch {
      toast.error('Failed to import variables')
    }
  }

  const environments = project?.environments ?? []
  const activeEnv = environments.find((e) => e.name === activeTab)
  const variables = (activeEnv?.variables ?? []).filter(
    (v) => !search || v.key.toLowerCase().includes(search.toLowerCase())
  )

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<{
    key: string; value: string; description?: string; is_secret: boolean
  }>({ defaultValues: { is_secret: false } })

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCopy = useCallback(async (v: EnvironmentVariable) => {
    await copyToClipboard(v.value, `Copied ${v.key}`)
    setCopiedId(v.id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const handleCopyAll = useCallback(async () => {
    const envText = variables.map((v) => `${v.key}=${v.value}`).join('\n')
    await copyToClipboard(envText, 'Copied all variables!')
  }, [variables])

  const ensureEnvExists = async () => {
    if (!activeEnv) {
      await createEnvironment(activeTab)
    }
  }

  const handleAddVar = async (data: { key: string; value: string; description?: string; is_secret: boolean }) => {
    await ensureEnvExists()
    const env = project?.environments?.find((e) => e.name === activeTab)
    const envId = env?.id || activeEnv?.id
    if (!envId) { toast.error('Create environment first'); return }
    try {
      await createEnvVariable({ environment_id: envId, ...data })
      toast.success('Variable added!')
      setAddVarOpen(false)
      reset()
    } catch { toast.error('Failed to add variable') }
  }

  const handleEditVar = async (data: { key: string; value: string; description?: string; is_secret: boolean }) => {
    if (!editVar) return
    try {
      await updateEnvVariable({ varId: editVar.id, data })
      toast.success('Variable updated!')
      setEditVar(null)
      reset()
    } catch { toast.error('Failed to update variable') }
  }

  const handleDeleteVar = async () => {
    if (!deleteVar) return
    try {
      await deleteEnvVariable(deleteVar.id)
      toast.success('Variable deleted')
      setDeleteVar(null)
    } catch { toast.error('Failed to delete') }
  }

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="flex gap-2 mb-4">
          {ENV_TABS.map((t) => <div key={t} className="h-8 bg-white/[0.06] rounded-full w-24" />)}
        </div>
        <div className="glass-card p-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="h-4 bg-white/[0.06] rounded w-1/4" />
              <div className="h-4 bg-white/[0.04] rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Tab switcher */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        {ENV_TABS.map((tab) => {
          const count = environments.find((e) => e.name === tab)?.variables.length ?? 0
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border',
                activeTab === tab
                  ? 'bg-primary/20 text-primary border-primary/30'
                  : 'bg-white/5 text-muted border-white/[0.06] hover:text-white'
              )}
            >
              {tab} {count > 0 && `(${count})`}
            </button>
          )
        })}
      </div>

      {/* Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search variables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-10"
          />
        </div>
        <div className="flex gap-2">
          {variables.length > 0 && (
            <Button variant="secondary" size="sm" onClick={handleCopyAll} iconLeft={<Copy className="w-3.5 h-3.5" />}>
              Copy All
            </Button>
          )}
          {!user?.is_guest && (
            <>
              <Button variant="secondary" size="sm" onClick={() => { setEnvRawText(''); setParsedVars([]); setImportEnvOpen(true) }} iconLeft={<ClipboardList className="w-3.5 h-3.5" />}>
                Import .env
              </Button>
              <Button size="sm" onClick={() => { reset({ is_secret: false }); setAddVarOpen(true) }} iconLeft={<Plus className="w-3.5 h-3.5" />}>
                Add Variable
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Variables display */}
      {variables.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <FileCode className="w-8 h-8 text-muted mx-auto mb-3 opacity-50" />
          <p className="text-white font-medium mb-1">No variables in {activeTab}</p>
          <p className="text-muted text-sm mb-4">Add environment variables for this environment.</p>
          {!user?.is_guest && (
            <div className="flex justify-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => { setEnvRawText(''); setParsedVars([]); setImportEnvOpen(true) }} iconLeft={<ClipboardList className="w-4 h-4" />}>
                Import .env
              </Button>
              <Button size="sm" onClick={() => setAddVarOpen(true)} iconLeft={<Plus className="w-4 h-4" />}>
                Add Variable
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-black/40 rounded-xl border border-white/[0.08] overflow-hidden">
          {variables.map((v, idx) => {
            const isRevealed = revealedIds.has(v.id)
            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 group',
                  idx !== variables.length - 1 && 'border-b border-white/[0.04]',
                  'hover:bg-white/[0.02] transition-colors'
                )}
              >
                <span className="mono text-xs text-primary font-semibold w-1/3 truncate shrink-0">
                  {v.key}
                </span>
                <span className="mono text-xs text-muted flex-1 truncate">
                  {v.is_secret && !isRevealed
                    ? '●'.repeat(Math.min(v.value.length, 12))
                    : v.value}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {v.is_secret && (
                    <button
                      onClick={() => toggleReveal(v.id)}
                      className="p-1 rounded text-muted hover:text-white transition-colors"
                      title={isRevealed ? 'Hide' : 'Reveal'}
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <button
                    onClick={() => handleCopy(v)}
                    className="p-1 rounded text-muted hover:text-primary transition-colors"
                    title="Copy value"
                  >
                    {copiedId === v.id ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {!user?.is_guest && (
                    <>
                      <button
                        onClick={() => {
                          setEditVar(v)
                          setValue('key', v.key)
                          setValue('value', v.value)
                          setValue('description', v.description ?? '')
                          setValue('is_secret', v.is_secret)
                        }}
                        className="p-1 rounded text-muted hover:text-white transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteVar(v)}
                        className="p-1 rounded text-muted hover:text-danger transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add variable modal */}
      <Modal isOpen={addVarOpen} onClose={() => { setAddVarOpen(false); reset() }} title="Add Variable" size="md">
        <form onSubmit={handleSubmit(handleAddVar)} className="space-y-4">
          <Input label="Key *" placeholder="DATABASE_URL" error={errors.key?.message} {...register('key', { required: 'Key is required' })} />
          <Input label="Value *" placeholder="postgresql://..." error={errors.value?.message} {...register('value', { required: 'Value is required' })} />
          <Input label="Description" placeholder="Optional description" {...register('description')} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_secret')} className="rounded" />
            <span className="text-sm text-white/80">Mark as secret (masked by default)</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setAddVarOpen(false); reset() }}>Cancel</Button>
            <Button type="submit">Add Variable</Button>
          </div>
        </form>
      </Modal>

      {/* Edit variable modal */}
      <Modal isOpen={!!editVar} onClose={() => { setEditVar(null); reset() }} title="Edit Variable" size="md">
        <form onSubmit={handleSubmit(handleEditVar)} className="space-y-4">
          <Input label="Key *" {...register('key', { required: true })} />
          <Input label="Value *" {...register('value', { required: true })} />
          <Input label="Description" {...register('description')} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_secret')} className="rounded" />
            <span className="text-sm text-white/80">Mark as secret</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setEditVar(null); reset() }}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteVar}
        onClose={() => setDeleteVar(null)}
        onConfirm={handleDeleteVar}
        title="Delete Variable"
        message={`Delete "${deleteVar?.key}"?`}
        confirmLabel="Delete"
        dangerous
      />
      {/* Import .env Modal */}
      <Modal isOpen={importEnvOpen} onClose={() => { setImportEnvOpen(false) }} title="Import from .env File" size="lg">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-primary/[0.04] border border-primary/20 text-xs text-primary/90">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p>
              Paste your <strong>.env</strong> file contents below. We will parse it and store each key and value as a separate variable, exactly like Vercel. Lines starting with # are automatically ignored.
            </p>
          </div>

          <Textarea
            label="Paste .env Contents"
            placeholder="DATABASE_URL=postgresql://user:pass@localhost:5432/db&#10;JWT_SECRET=super-secret-key&#10;PORT=3000"
            rows={6}
            value={envRawText}
            onChange={(e) => {
              setEnvRawText(e.target.value)
              parseEnvText(e.target.value)
            }}
          />

          {parsedVars.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Preview Parsed Variables ({parsedVars.length})
              </h4>
              <div className="max-h-[220px] overflow-y-auto border border-white/[0.08] rounded-xl overflow-hidden divide-y divide-white/[0.04] bg-black/20">
                {parsedVars.map((v, i) => (
                  <div key={v.key} className="flex items-center gap-3 px-3 py-2 text-xs">
                    <input
                      type="checkbox"
                      checked={v.selected}
                      onChange={(e) => {
                        const copy = [...parsedVars]
                        copy[i].selected = e.target.checked
                        setParsedVars(copy)
                      }}
                      className="rounded accent-primary"
                    />
                    <span className="mono text-primary font-medium w-1/3 truncate shrink-0 select-none">
                      {v.key}
                    </span>
                    <span className="mono text-muted flex-1 truncate select-none">
                      {v.value}
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer shrink-0 text-muted hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={v.is_secret}
                        onChange={(e) => {
                          const copy = [...parsedVars]
                          copy[i].is_secret = e.target.checked
                          setParsedVars(copy)
                        }}
                        className="rounded"
                      />
                      <span>Secret</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setImportEnvOpen(false) }}>Cancel</Button>
            <Button
              type="button"
              disabled={parsedVars.filter(v => v.selected).length === 0}
              onClick={handleImportEnv}
            >
              Import {parsedVars.filter(v => v.selected).length} Variables
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
