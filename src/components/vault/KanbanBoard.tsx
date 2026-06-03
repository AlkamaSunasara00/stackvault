'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Calendar, AlertCircle, Edit2, Trash2, ArrowRight, ArrowLeft,
  X, CheckSquare, ClipboardList, HelpCircle
} from 'lucide-react'
import { useProject } from '@/hooks/useProject'
import { Task, TaskStatus, TaskPriority } from '@/types'
import { ConfirmModal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

interface KanbanBoardProps {
  projectId: string
}

const statusColumns: Array<{ id: TaskStatus; label: string; bg: string; text: string; border: string }> = [
  { id: TaskStatus.TODO, label: 'To Do', bg: 'bg-white/5', text: 'text-muted', border: 'border-white/[0.08]' },
  { id: TaskStatus.IN_PROGRESS, label: 'In Progress', bg: 'bg-[var(--notion-blue-bg)]', text: 'text-[var(--notion-blue)]', border: 'border-blue-500/10' },
  { id: TaskStatus.REVIEW, label: 'In Review', bg: 'bg-[var(--notion-yellow-bg)]', text: 'text-[var(--notion-yellow)]', border: 'border-yellow-500/10' },
  { id: TaskStatus.DONE, label: 'Completed', bg: 'bg-[var(--notion-green-bg)]', text: 'text-[var(--notion-green)]', border: 'border-green-500/10' },
]

const priorityBadges: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'badge-tint-mint',
  [TaskPriority.MEDIUM]: 'badge-tint-peach',
  [TaskPriority.HIGH]: 'badge-tint-rose',
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { project, createTask, updateTask, deleteTask, isLoading } = useProject(projectId)
  const [activeModal, setActiveModal] = useState<'create' | 'edit' | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    due_date: '',
  })

  const tasks = project?.tasks ?? []

  const handleOpenCreate = (status: TaskStatus) => {
    setForm({
      title: '',
      description: '',
      status,
      priority: TaskPriority.MEDIUM,
      due_date: '',
    })
    setActiveModal('create')
  }

  const handleOpenEdit = (task: Task) => {
    setSelectedTask(task)
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    })
    setActiveModal('edit')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }

    try {
      if (activeModal === 'create') {
        await createTask({
          title: form.title,
          description: form.description || null,
          status: form.status,
          priority: form.priority,
          due_date: form.due_date || null,
        })
        toast.success('Task created')
      } else if (activeModal === 'edit' && selectedTask) {
        await updateTask({
          taskId: selectedTask.id,
          data: {
            title: form.title,
            description: form.description || null,
            status: form.status,
            priority: form.priority,
            due_date: form.due_date || null,
          },
        })
        toast.success('Task updated')
      }
      setActiveModal(null)
      setSelectedTask(null)
    } catch {
      toast.error('Failed to save task')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteTask(deleteTarget.id)
      toast.success('Task deleted')
      setDeleteTarget(null)
      if (selectedTask?.id === deleteTarget.id) {
        setActiveModal(null)
        setSelectedTask(null)
      }
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleMoveStatus = async (task: Task, direction: 'forward' | 'backward') => {
    const statuses = Object.values(TaskStatus)
    const curIdx = statuses.indexOf(task.status)
    let nextIdx = curIdx + (direction === 'forward' ? 1 : -1)
    if (nextIdx >= 0 && nextIdx < statuses.length) {
      const nextStatus = statuses[nextIdx]
      try {
        await updateTask({
          taskId: task.id,
          data: { status: nextStatus },
        })
        toast.success(`Moved to ${nextStatus.replace('_', ' ')}`)
      } catch {
        toast.error('Failed to move task')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-4 h-96 space-y-3 bg-black/[0.01]">
            <div className="h-5 bg-black/[0.05] rounded w-1/3 mb-4" />
            <div className="h-20 bg-black/[0.03] rounded-lg" />
            <div className="h-20 bg-black/[0.03] rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Kanban Board Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start overflow-x-auto pb-4">
          {statusColumns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id)
            return (
              <div
                key={col.id}
                className="flex flex-col bg-sidebar/40 border border-border rounded-xl p-3.5 min-h-[450px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded border select-none", col.bg, col.text, col.border)}>
                      {col.label}
                    </span>
                    <span className="text-xs text-muted font-medium">{colTasks.length}</span>
                  </div>
                  <button
                    onClick={() => handleOpenCreate(col.id)}
                    className="p-1 rounded text-muted hover:text-white hover:bg-white/5 transition-colors"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Task Cards Container */}
                <div className="flex-1 flex flex-col gap-2.5 min-h-[350px]">
                  <AnimatePresence initial={false}>
                    {colTasks.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg text-center select-none bg-black/[0.02]">
                        <ClipboardList className="w-6 h-6 text-muted mb-1.5 opacity-50" />
                        <p className="text-[11px] text-muted">No tasks</p>
                        <button
                          onClick={() => handleOpenCreate(col.id)}
                          className="mt-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                          + New Task
                        </button>
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          layoutId={`card-${task.id}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="group relative bg-card border border-border p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={() => handleOpenEdit(task)}
                        >
                          {/* Card details */}
                          <div className="flex items-start justify-between gap-1.5 mb-1.5">
                            <span className={clsx("text-[10px] px-2 py-0.5 rounded font-bold uppercase select-none", priorityBadges[task.priority])}>
                              {task.priority}
                            </span>
                            {/* Hover Action buttons */}
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenEdit(task)}
                                className="p-1 text-muted hover:text-white rounded hover:bg-white/5"
                                title="Edit"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(task)}
                                className="p-1 text-muted hover:text-danger rounded hover:bg-danger/10"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug mb-1">{task.title}</h4>
                          {task.description && (
                            <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-3">{task.description}</p>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between border-t border-border pt-2 mt-2 gap-1.5">
                            <div className="flex items-center gap-1 text-[10px] text-muted font-medium">
                              {task.due_date && (
                                <>
                                  <Calendar className="w-3 h-3 text-[#7E7E7C]" />
                                  <span>{new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </>
                              )}
                            </div>

                            {/* Move quick action buttons */}
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              {task.status !== TaskStatus.TODO && (
                                <button
                                  onClick={() => handleMoveStatus(task, 'backward')}
                                  className="p-1 text-muted hover:text-white rounded hover:bg-white/5"
                                  title="Move Left"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {task.status !== TaskStatus.DONE && (
                                <button
                                  onClick={() => handleMoveStatus(task, 'forward')}
                                  className="p-1 text-muted hover:text-white rounded hover:bg-white/5"
                                  title="Move Right"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                {/* Add new button at bottom of col */}
                {colTasks.length > 0 && (
                  <button
                    onClick={() => handleOpenCreate(col.id)}
                    className="mt-3.5 w-full flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-muted hover:text-white hover:bg-white/5 border border-transparent hover:border-border rounded-lg transition-all duration-150"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Task
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-xl shadow-modal max-w-md w-full overflow-hidden p-6 z-50 relative"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                {activeModal === 'create' ? 'Create New Task' : 'Edit Task Details'}
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                <Input
                  id="task-title"
                  label="Task Title"
                  placeholder="Review schema definitions..."
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  required
                />

                <Textarea
                  id="task-desc"
                  label="Description"
                  placeholder="Add details about this task..."
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    id="task-status"
                    label="Status"
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as TaskStatus }))}
                  >
                    <option value={TaskStatus.TODO}>To Do</option>
                    <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                    <option value={TaskStatus.REVIEW}>In Review</option>
                    <option value={TaskStatus.DONE}>Completed</option>
                  </Select>

                  <Select
                    id="task-priority"
                    label="Priority"
                    value={form.priority}
                    onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as TaskPriority }))}
                  >
                    <option value={TaskPriority.LOW}>Low</option>
                    <option value={TaskPriority.MEDIUM}>Medium</option>
                    <option value={TaskPriority.HIGH}>High</option>
                  </Select>
                </div>

                <Input
                  id="task-duedate"
                  label="Due Date"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))}
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveModal(null)}
                  >
                    Cancel
                  </Button>
                  {activeModal === 'edit' && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteTarget(selectedTask)}
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Delete task "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Task"
        dangerous
      />
    </>
  )
}
