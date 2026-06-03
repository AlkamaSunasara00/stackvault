'use client'

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  iconLeft?: React.ReactNode
  fullWidth?: boolean
}

export const Input = React.memo(
  React.forwardRef<HTMLInputElement, InputProps>(function Input(
    { label, error, hint, iconLeft, fullWidth = true, className, type, id, ...props },
    ref
  ) {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`

    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-white/90">
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              {iconLeft}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={twMerge(
              clsx(
                'input-dark',
                iconLeft && 'pl-10',
                isPassword && 'pr-10',
                error && 'border-danger/50 focus:border-danger/70 focus:ring-danger/20',
                className
              )
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
        {hint && !error && <p className="text-xs text-muted mt-0.5">{hint}</p>}
      </div>
    )
  })
)

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  fullWidth?: boolean
}

export const Textarea = React.memo(
  React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    { label, error, hint, fullWidth = true, className, id, ...props },
    ref
  ) {
    const inputId = id || `textarea-${Math.random().toString(36).slice(2)}`
    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-white/90">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={twMerge(
            clsx(
              'input-dark resize-none min-h-[100px]',
              error && 'border-danger/50',
              className
            )
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
        {hint && !error && <p className="text-xs text-muted mt-0.5">{hint}</p>}
      </div>
    )
  })
)

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  fullWidth?: boolean
  children: React.ReactNode
}

export const Select = React.memo(
  React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
    { label, error, fullWidth = true, className, id, children, ...props },
    ref
  ) {
    const inputId = id || `select-${Math.random().toString(36).slice(2)}`
    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-white/90">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={twMerge(
            clsx(
              'input-dark appearance-none cursor-pointer',
              'bg-[var(--notion-bg-dropdown)]',
              error && 'border-danger/50',
              className
            )
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
      </div>
    )
  })
)
