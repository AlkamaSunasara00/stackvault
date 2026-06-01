'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/hooks/useAuth'
import { Settings, User, Shield, Bell, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

type ProfileForm = z.infer<typeof profileSchema>

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

export default function SettingsPage() {
  const { user, supabaseUser, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)

  const displayName = user?.name || supabaseUser?.user_metadata?.name || 'User'
  const avatarUrl = user?.avatar_url || supabaseUser?.user_metadata?.avatar_url

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: displayName },
  })

  const onSaveProfile = async (data: ProfileForm) => {
    setLoading(true)
    try {
      await updateProfile({ name: data.name })
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-muted text-sm">Manage your account and preferences</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-white/[0.06] pb-0 -mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'text-primary' : 'text-muted hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="settings-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pt-2">
          {/* Avatar section */}
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold text-white mb-4">Profile Picture</h3>
            <div className="flex items-center gap-5">
              <Avatar src={avatarUrl} name={displayName} size="xl" />
              <div>
                <button className="btn-ghost text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload new picture
                </button>
                <p className="text-xs text-muted mt-1">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </div>

          {/* Profile info */}
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold text-white mb-4">Personal Information</h3>
            <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
              <Input
                label="Full Name"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Email Address"
                type="email"
                value={user?.email || supabaseUser?.email || ''}
                disabled
                hint="Email cannot be changed here. Contact support."
              />
              <div className="flex justify-end">
                <Button type="submit" loading={loading}>Save Changes</Button>
              </div>
            </form>
          </div>

          {/* Account info */}
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold text-white mb-4">Account Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">User ID</span>
                <span className="mono text-xs text-white/60">{user?.id?.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Member since</span>
                <span className="text-white/70">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pt-2">
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold text-white mb-4">Change Password</h3>
            <p className="text-muted text-sm mb-4">
              You are signed in via Supabase Auth. Use the forgot password flow to reset your password.
            </p>
            <Button variant="secondary" size="sm">Send Password Reset Email</Button>
          </div>

          <div className="glass-card p-6 border-danger/20">
            <h3 className="text-base font-semibold text-danger mb-2">Danger Zone</h3>
            <p className="text-muted text-sm mb-4">
              Delete your account and all associated data permanently.
            </p>
            <Button variant="danger" size="sm">Delete Account</Button>
          </div>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pt-2">
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold text-white mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { label: 'Project created', desc: 'When a new project is created' },
                { label: 'Project updated', desc: 'When a project is modified' },
                { label: 'Deployment logged', desc: 'When a deployment is recorded' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{item.label}</p>
                    <p className="text-xs text-muted">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:bg-primary transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
