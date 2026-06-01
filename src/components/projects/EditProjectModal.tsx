'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { useProjects } from '@/hooks/useProjects'
import { useAuth } from '@/hooks/useAuth'
import { Project, ProjectStatus } from '@/types'
import { PROJECT_STATUSES } from '@/utils/constants'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1, 'Project name is required').max(80),
  description: z.string().optional(),
  client_name: z.string().optional(),
  status: z.nativeEnum(ProjectStatus),
})

type FormData = z.infer<typeof schema>

interface EditProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
}

export function EditProjectModal({ isOpen, onClose, project }: EditProjectModalProps) {
  const { updateProject, isUpdating } = useProjects()
  const { addNotification } = useAuth()
  const [techInput, setTechInput] = useState('')
  const [techStack, setTechStack] = useState<string[]>(project.tech_stack ?? [])
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(project.logo_url ?? null)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: project.name,
      description: project.description ?? '',
      client_name: project.client_name ?? '',
      status: project.status,
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        name: project.name,
        description: project.description ?? '',
        client_name: project.client_name ?? '',
        status: project.status,
      })
      setTechStack(project.tech_stack ?? [])
      setLogoPreview(project.logo_url ?? null)
      setLogoFile(null)
    }
  }, [isOpen, project, reset])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2MB'); return }
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const addTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault()
      const tech = techInput.trim()
      if (!techStack.includes(tech)) setTechStack((prev) => [...prev, tech])
      setTechInput('')
    }
  }

  const removeTech = (tech: string) => setTechStack((prev) => prev.filter((t) => t !== tech))

  const onSubmit = async (data: FormData) => {
    const fd = new FormData()
    fd.set('name', data.name)
    fd.set('description', data.description || '')
    fd.set('client_name', data.client_name || '')
    fd.set('status', data.status)
    fd.set('tech_stack', JSON.stringify(techStack))
    if (logoFile) fd.set('logo', logoFile)

    try {
      await updateProject({ id: project.id, formData: fd })
      addNotification({ title: 'Project updated', message: `"${data.name}" was updated.`, type: 'success' })
      onClose()
    } catch {
      toast.error('Failed to update project')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex items-center gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-white/[0.12] hover:border-primary/40 cursor-pointer flex items-center justify-center bg-white/[0.02] transition-colors overflow-hidden"
          >
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-5 h-5 text-muted" />
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm text-primary hover:underline flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              {logoPreview ? 'Change logo' : 'Upload logo'}
            </button>
            <p className="text-xs text-muted mt-0.5">PNG, JPG up to 2MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Project Name *"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input label="Client Name" {...register('client_name')} />
        </div>

        <Textarea label="Description" rows={3} {...register('description')} />

        <Select label="Status" {...register('status')}>
          {PROJECT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/90">Tech Stack</label>
          <Input
            placeholder="Type a technology and press Enter..."
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={addTech}
            fullWidth
          />
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium"
                >
                  {tech}
                  <button type="button" onClick={() => removeTech(tech)}>
                    <X className="w-3 h-3 hover:text-white" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isUpdating}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  )
}
