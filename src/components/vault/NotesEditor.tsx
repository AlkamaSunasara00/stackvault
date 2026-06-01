'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, Pin, Pencil, Trash2, X, Eye, Code2, Save, Check } from 'lucide-react'
import { useProject } from '@/hooks/useProject'
import { ProjectNote } from '@/types'
import { ConfirmModal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatRelative } from '@/utils/formatDate'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

interface NotesEditorProps {
  projectId: string
}

export function NotesEditor({ projectId }: NotesEditorProps) {
  const { project, createNote, updateNote, deleteNote, isLoading } = useProject(projectId)
  const [selectedNote, setSelectedNote] = useState<ProjectNote | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProjectNote | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    is_pinned: false,
  })

  const notes = project?.notes ?? []
  const pinned = notes.filter((n) => n.is_pinned)
  const unpinned = notes.filter((n) => !n.is_pinned)

  const openNote = (note: ProjectNote) => {
    setSelectedNote(note)
    setForm({ title: note.title, content: note.content, tags: note.tags, is_pinned: note.is_pinned })
    setPreviewMode(false)
    setSaved(false)
  }

  const openNew = () => {
    setSelectedNote(null)
    setIsCreating(true)
    setForm({ title: '', content: '', tags: [], is_pinned: false })
    setPreviewMode(false)
  }

  const handleSave = useCallback(async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    try {
      if (isCreating) {
        const note = await createNote({ ...form })
        setSelectedNote(note as ProjectNote)
        setIsCreating(false)
      } else if (selectedNote) {
        await updateNote({ noteId: selectedNote.id, data: form })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      toast.success(isCreating ? 'Note created!' : 'Note saved!')
    } catch { toast.error('Failed to save note') }
  }, [form, isCreating, createNote, updateNote, selectedNote])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteNote(deleteTarget.id)
      toast.success('Note deleted')
      if (selectedNote?.id === deleteTarget.id) { setSelectedNote(null); setIsCreating(false) }
      setDeleteTarget(null)
    } catch { toast.error('Failed to delete note') }
  }

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const tag = tagInput.trim()
      if (!form.tags.includes(tag)) setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) =>
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))

  const isEditing = isCreating || !!selectedNote

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-4 space-y-2">
            <div className="h-4 bg-white/[0.06] rounded w-3/4" />
            <div className="h-3 bg-white/[0.04] rounded w-full" />
            <div className="h-3 bg-white/[0.04] rounded w-5/6" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        <Button onClick={openNew} iconLeft={<Plus className="w-4 h-4" />}>
          New Note
        </Button>
      </div>

      {!isEditing ? (
        /* Grid view */
        notes.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <FileText className="w-8 h-8 text-muted mx-auto mb-3 opacity-50" />
            <p className="text-white font-medium mb-1">No notes yet</p>
            <p className="text-muted text-sm mb-4">Capture ideas, docs, and project knowledge.</p>
            <Button onClick={openNew} iconLeft={<Plus className="w-4 h-4" />} size="sm">New Note</Button>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5" /> Pinned
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pinned.map((note) => <NoteCard key={note.id} note={note} onClick={() => openNote(note)} onDelete={() => setDeleteTarget(note)} />)}
                </div>
              </div>
            )}
            {unpinned.length > 0 && (
              <div>
                {pinned.length > 0 && <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">All Notes</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {unpinned.map((note) => <NoteCard key={note.id} note={note} onClick={() => openNote(note)} onDelete={() => setDeleteTarget(note)} />)}
                </div>
              </div>
            )}
          </>
        )
      ) : (
        /* Editor view */
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { setSelectedNote(null); setIsCreating(false) }} className="text-muted hover:text-white transition-colors flex items-center gap-1.5 text-sm">
              <X className="w-4 h-4" /> Back to notes
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setForm((prev) => ({ ...prev, is_pinned: !prev.is_pinned }))}
                className={clsx('p-1.5 rounded-lg transition-colors', form.is_pinned ? 'text-warning bg-warning/10' : 'text-muted hover:text-white hover:bg-white/5')}
                title={form.is_pinned ? 'Unpin' : 'Pin'}
              >
                <Pin className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode((v) => !v)}
                className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors"
                title={previewMode ? 'Edit' : 'Preview'}
              >
                {previewMode ? <Code2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {selectedNote && (
                <button onClick={() => setDeleteTarget(selectedNote)} className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <Button size="sm" onClick={handleSave} iconLeft={saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}>
                {saved ? 'Saved!' : 'Save'}
              </Button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Note title..."
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full bg-transparent text-2xl font-bold text-white placeholder:text-white/20 outline-none mb-4 border-0"
          />

          {previewMode ? (
            <div className="prose prose-invert prose-sm max-w-none min-h-[200px] text-white/80">
              <ReactMarkdown>{form.content || '*No content yet...*'}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              placeholder="Write your note in Markdown..."
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              className="w-full bg-transparent text-sm text-white/80 placeholder:text-muted outline-none resize-none min-h-[250px] mono leading-relaxed"
            />
          )}

          {/* Tags */}
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/30 text-xs">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tag and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              className="bg-transparent text-sm text-muted placeholder:text-muted/60 outline-none w-full"
            />
          </div>
        </motion.div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Note"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Note"
        dangerous
      />
    </>
  )
}

function NoteCard({ note, onClick, onDelete }: { note: ProjectNote; onClick: () => void; onDelete: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="glass-card p-4 cursor-pointer group flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-white line-clamp-1">
          {note.is_pinned && <Pin className="w-3 h-3 text-warning inline mr-1" />}
          {note.title}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="p-1 rounded text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-xs text-muted line-clamp-3 leading-relaxed">{note.content || 'Empty note'}</p>
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/10 text-secondary">#{tag}</span>
          ))}
        </div>
      )}
      <p className="text-[10px] text-muted mt-auto">{formatRelative(note.updated_at)}</p>
    </motion.div>
  )
}
