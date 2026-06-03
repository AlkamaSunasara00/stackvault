'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Plus, Pin, Trash2, X, Eye, Code2, Save, Check, Bold, Italic,
  Heading1, Heading2, List, ListTodo, Code, SquareCode, Link2, Columns, Copy, Pencil
} from 'lucide-react'
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

const pastelColors = [
  'badge-tint-peach',
  'badge-tint-rose',
  'badge-tint-mint',
  'badge-tint-lavender',
  'badge-tint-sky',
  'badge-tint-yellow',
]

const getTagColorClass = (tag: string) => {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  return pastelColors[Math.abs(hash) % pastelColors.length]
}

// Custom Premium CodeBlock
function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success('Code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-[#EDEDEB] bg-[#0B0F19] text-white font-mono text-sm shadow-md">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#161E2E] border-b border-[#EDEDEB]/10 text-xs text-slate-400 select-none">
        <span className="font-semibold uppercase tracking-wider">{language || 'code'}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 hover:text-white transition-colors py-1 px-1.5 rounded hover:bg-white/5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      {/* Code body */}
      <pre className="p-4 overflow-x-auto leading-relaxed text-[#A9B1D6]">
        <code>{value}</code>
      </pre>
    </div>
  )
}

export function NotesEditor({ projectId }: NotesEditorProps) {
  const { project, createNote, updateNote, deleteNote, isLoading } = useProject(projectId)
  const [selectedNote, setSelectedNote] = useState<ProjectNote | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProjectNote | null>(null)
  const [editorLayout, setEditorLayout] = useState<'edit' | 'preview' | 'split'>('edit')
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
    setEditorLayout('edit')
    setSaved(false)
  }

  const openNew = () => {
    setSelectedNote(null)
    setIsCreating(true)
    setForm({ title: '', content: '', tags: [], is_pinned: false })
    setEditorLayout('edit')
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

  const insertFormat = (before: string, after: string = '') => {
    const textarea = document.getElementById('notes-textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value

    const selected = text.substring(start, end)
    const replacement = before + (selected || '') + after

    const newContent = text.substring(0, start) + replacement + text.substring(end)
    setForm((prev) => ({ ...prev, content: newContent }))

    // Refocus and place cursor
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selected || '').length
      )
    }, 0)
  }

  const isEditing = isCreating || !!selectedNote

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-5 space-y-3">
            <div className="h-4 bg-black/[0.05] rounded w-3/4" />
            <div className="h-3 bg-black/[0.03] rounded w-full" />
            <div className="h-3 bg-black/[0.03] rounded w-5/6" />
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
          <div className="glass-card p-10 text-center border border-[#EDEDEB] rounded-xl">
            <FileText className="w-8 h-8 text-muted mx-auto mb-3 opacity-50" />
            <p className="text-slate-800 font-medium mb-1">No notes yet</p>
            <p className="text-muted text-sm mb-4">Capture ideas, logs, documentation, and project knowledge.</p>
            <Button onClick={openNew} iconLeft={<Plus className="w-4 h-4" />} size="sm">New Note</Button>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-warning" /> Pinned
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinned.map((note) => <NoteCard key={note.id} note={note} onClick={() => openNote(note)} onDelete={() => setDeleteTarget(note)} />)}
                </div>
              </div>
            )}
            {unpinned.length > 0 && (
              <div>
                {pinned.length > 0 && <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">All Notes</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          className="glass-card p-6 border border-[#EDEDEB] rounded-xl bg-white shadow-sm"
        >
          {/* Editor Header controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDEDEB] pb-4 mb-4">
            <button onClick={() => { setSelectedNote(null); setIsCreating(false) }} className="text-muted hover:text-slate-900 transition-colors flex items-center gap-1.5 text-sm font-medium">
              <X className="w-4 h-4" /> Back to notes
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setForm((prev) => ({ ...prev, is_pinned: !prev.is_pinned }))}
                className={clsx('p-1.5 rounded-lg transition-colors', form.is_pinned ? 'text-warning bg-warning/10' : 'text-muted hover:text-slate-900 hover:bg-black/[0.04]')}
                title={form.is_pinned ? 'Unpin note' : 'Pin note'}
              >
                <Pin className="w-4 h-4" />
              </button>

              {/* Layout togglers */}
              <div className="flex items-center bg-black/[0.03] border border-[#EDEDEB] rounded-lg p-0.5">
                <button
                  onClick={() => setEditorLayout('edit')}
                  className={clsx('px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1', editorLayout === 'edit' ? 'bg-white text-slate-800 shadow-sm border border-[#EDEDEB]' : 'text-muted hover:text-slate-850')}
                  title="Write Mode"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => setEditorLayout('preview')}
                  className={clsx('px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1', editorLayout === 'preview' ? 'bg-white text-slate-800 shadow-sm border border-[#EDEDEB]' : 'text-muted hover:text-slate-850')}
                  title="Preview Mode"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Preview</span>
                </button>
                <button
                  onClick={() => setEditorLayout('split')}
                  className={clsx('hidden md:flex px-2.5 py-1 text-xs font-medium rounded-md transition-colors items-center gap-1', editorLayout === 'split' ? 'bg-white text-slate-800 shadow-sm border border-[#EDEDEB]' : 'text-muted hover:text-slate-850')}
                  title="Split Screen Layout"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Split</span>
                </button>
              </div>

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
            placeholder="Untitled Note"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full bg-transparent text-2xl font-bold text-slate-850 placeholder:text-slate-300 outline-none mb-2 border-0 px-0 focus:ring-0 focus:outline-none"
          />

          {/* Formatting Toolbar */}
          {editorLayout !== 'preview' && (
            <div className="flex flex-wrap items-center gap-1 bg-black/[0.02] border border-[#EDEDEB] rounded-lg p-1 mb-3">
              <button type="button" onClick={() => insertFormat('**', '**')} className="p-1.5 rounded text-slate-600 hover:text-slate-950 hover:bg-black/[0.04]" title="Bold"><Bold className="w-4 h-4" /></button>
              <button type="button" onClick={() => insertFormat('*', '*')} className="p-1.5 rounded text-slate-600 hover:text-slate-950 hover:bg-black/[0.04]" title="Italic"><Italic className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-[#EDEDEB] mx-1" />
              <button type="button" onClick={() => insertFormat('# ', '')} className="p-1.5 rounded text-slate-600 hover:text-slate-950 hover:bg-black/[0.04] text-xs font-bold" title="H1"><Heading1 className="w-4 h-4" /></button>
              <button type="button" onClick={() => insertFormat('## ', '')} className="p-1.5 rounded text-slate-600 hover:text-slate-950 hover:bg-black/[0.04] text-xs font-bold" title="H2"><Heading2 className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-[#EDEDEB] mx-1" />
              <button type="button" onClick={() => insertFormat('- ', '')} className="p-1.5 rounded text-slate-600 hover:text-slate-950 hover:bg-black/[0.04]" title="List"><List className="w-4 h-4" /></button>
              <button type="button" onClick={() => insertFormat('- [ ] ', '')} className="p-1.5 rounded text-slate-600 hover:text-slate-950 hover:bg-black/[0.04]" title="Tasklist"><ListTodo className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-[#EDEDEB] mx-1" />
              <button type="button" onClick={() => insertFormat('`', '`')} className="p-1.5 rounded text-slate-600 hover:text-slate-950 hover:bg-black/[0.04]" title="Inline Code"><Code className="w-4 h-4" /></button>
              <button type="button" onClick={() => insertFormat('```javascript\n', '\n```')} className="p-1.5 rounded text-slate-600 hover:text-slate-950 hover:bg-black/[0.04]" title="Code Block"><SquareCode className="w-4 h-4" /></button>
              <button type="button" onClick={() => insertFormat('[', '](url)')} className="p-1.5 rounded text-slate-600 hover:text-slate-950 hover:bg-black/[0.04]" title="Insert Link"><Link2 className="w-4 h-4" /></button>
            </div>
          )}

          {/* Editor Layout Renderer */}
          <div className={clsx(
            editorLayout === 'split' && 'grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]',
            editorLayout !== 'split' && 'min-h-[300px]'
          )}>
            {/* Editor Pane */}
            {(editorLayout === 'edit' || editorLayout === 'split') && (
              <div className={clsx(editorLayout === 'split' && 'border-r border-[#EDEDEB] pr-4')}>
                <textarea
                  id="notes-textarea"
                  placeholder="Write your note in Markdown... Use toolbars or standard syntax."
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none min-h-[300px] h-full font-mono leading-relaxed focus:ring-0 focus:outline-none border-0 p-0"
                />
              </div>
            )}

            {/* Preview Pane */}
            {(editorLayout === 'preview' || editorLayout === 'split') && (
              <div className="prose prose-sm max-w-none text-slate-850 overflow-y-auto">
                <ReactMarkdown
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      const inline = !className || !className.includes('language-')
                      return inline ? (
                        <code className="bg-black/[0.05] text-[#D15400] px-1.5 py-0.5 rounded font-mono text-xs" {...props}>
                          {children}
                        </code>
                      ) : (
                        <CodeBlock
                          language={match ? match[1] : ''}
                          value={String(children).replace(/\n$/, '')}
                        />
                      )
                    }
                  }}
                >
                  {form.content || '*No content yet...*'}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Tags editing */}
          <div className="mt-4 pt-4 border-t border-[#EDEDEB]">
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {form.tags.map((tag) => (
                <span key={tag} className={clsx("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold select-none", getTagColorClass(tag))}>
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tag and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              className="bg-transparent text-sm text-slate-500 placeholder:text-slate-300 outline-none w-full border-0 px-0 focus:ring-0 focus:outline-none"
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
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="glass-card p-5 cursor-pointer group flex flex-col gap-2.5 border border-[#EDEDEB] rounded-xl hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-slate-800 line-clamp-1">
          {note.is_pinned && <Pin className="w-3.5 h-3.5 text-warning inline mr-1" />}
          {note.title}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="p-1 rounded text-muted hover:text-danger hover:bg-danger/10 transition-all duration-150 opacity-0 group-hover:opacity-100 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{note.content || 'Empty note'}</p>
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={clsx("text-[10px] px-2 py-0.5 rounded font-semibold select-none", getTagColorClass(tag))}>#{tag}</span>
          ))}
        </div>
      )}
      <p className="text-[10px] text-muted mt-auto pt-1">{formatRelative(note.updated_at)}</p>
    </motion.div>
  )
}
