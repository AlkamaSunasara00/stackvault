'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Zap, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Invalid email'),
})

type ForgotForm = z.infer<typeof schema>

function AuthShowcase() {
  return (
    <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-[#0B0F19] text-white relative overflow-hidden select-none">
      {/* Decorative meshes & pastel dots */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 100 Q 200 150 400 50 T 800 200" fill="none" stroke="#5C1BE6" strokeWidth="1.5" strokeDasharray="5,5" />
          <path d="M -50 300 Q 150 250 350 400 T 750 350" fill="none" stroke="#0F766E" strokeWidth="1" />
        </svg>
        <div className="absolute top-[10%] left-[20%] w-8 h-8 rounded-full bg-[#FFF1F2] border border-[#FFE4E6] blur-sm" />
        <div className="absolute top-[25%] right-[15%] w-10 h-10 rounded-full bg-[#FDF2E9] border border-[#FDE6D2] blur-[1px]" />
        <div className="absolute bottom-[35%] left-[10%] w-12 h-12 rounded-full bg-[#ECFDF5] border border-[#D1FAE5] blur-sm animate-pulse" />
        <div className="absolute bottom-[15%] right-[25%] w-9 h-9 rounded-full bg-[#F5F3FF] border border-[#EDE9FE]" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-2.5 z-10">
        <div className="w-10 h-10 bg-[#5C1BE6]/20 border border-[#5C1BE6]/30 rounded-xl flex items-center justify-center">
          <Zap className="w-6 h-6 text-[#5C1BE6]" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">StackVault</span>
      </div>

      {/* Main Copy */}
      <div className="my-auto z-10 py-12 max-w-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-[#5C1BE6] bg-[#5C1BE6]/10 px-3 py-1 rounded-full border border-[#5C1BE6]/20">
          PRO-LEVEL VAULT
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight mt-4">
          Meet the developer's night shift.
        </h2>
        <p className="text-slate-400 mt-3 text-sm leading-relaxed">
          The all-in-one workspace to secure credentials, decrypt environment configurations, bookmark api links, and run agile sprints.
        </p>

        {/* Embedded Real Mockup Card */}
        <div className="mt-8 border border-white/10 rounded-xl bg-[#161E2E]/80 backdrop-blur-md p-4 shadow-[rgba(15,15,15,0.4)_0px_24px_48px_-8px] text-xs font-mono text-slate-300">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-[10px] text-slate-500">vault-config.json — Decrypted</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-[#A9B1D6]">
            <div><span className="text-[#F7768E]">const</span> vault = <span className="text-[#9ECE6A]">"StackVault"</span>;</div>
            <div><span className="text-[#F7768E]">const</span> status = <span className="text-[#E0AF68]">{`{`}</span></div>
            <div className="pl-4">encryption: <span className="text-[#9ECE6A]">"AES-256-GCM"</span>,</div>
            <div className="pl-4">connections: <span className="text-[#9ECE6A]">"Fully Encrypted"</span>,</div>
            <div className="pl-4">tasks_pending: <span className="text-[#73DACA]">4</span></div>
            <div><span className="text-[#E0AF68]">{`}`}</span>;</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="z-10 text-xs text-slate-500 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>AES-256 Cryptographic Core Active</span>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send email'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white font-sans">
      {/* Left pane - Showcase */}
      <AuthShowcase />

      {/* Right pane - Form */}
      <div className="flex flex-col items-center justify-center p-8 lg:col-span-7 bg-white relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-2 mb-8 absolute top-8">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-slate-900">StackVault</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm space-y-6"
        >
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-[#047857] mx-auto bg-[#ECFDF5] p-2 rounded-full border border-[#D1FAE5]" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Check your email</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We've sent a password reset link to your email address. Check your inbox to proceed.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline justify-center">
                  <ArrowLeft className="w-4 h-4" /> Back to log in
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reset password</h1>
                <p className="text-slate-500 mt-1 text-sm">Enter your registered email below to receive a password reset link.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  id="forgot-email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  iconLeft={<Mail className="w-4 h-4 text-muted" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" fullWidth loading={loading} size="lg">
                  Send reset link
                </Button>
              </form>

              <div className="text-center pt-2">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to log in
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
