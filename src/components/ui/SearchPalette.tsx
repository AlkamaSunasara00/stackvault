'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, FolderKanban, FileText, Link, Lock, ArrowRight, Loader2, Blocks } from 'lucide-react'
import { useSearch } from '@/context/SearchContext'
import { useRouter } from 'next/navigation'
import { SearchResult } from '@/types'

const typeIcons: Record<string, React.ReactNode> = {
  project: <FolderKanban className="w-4 h-4 text-primary" />,
  note: <FileText className="w-4 h-4 text-secondary" />,
  link: <Link className="w-4 h-4 text-warning" />,
  integration: <Blocks className="w-4 h-4 text-sky-400" />,
  credential: <Lock className="w-4 h-4 text-purple-400" />,
}

const typeLabels: Record<string, string> = {
  project: 'Project',
  note: 'Note',
  link: 'Link',
  integration: 'Integration',
  credential: 'Credential',
}

const typePaths: Record<string, (r: SearchResult) => string> = {
  project: (r) => `/projects/${r.id}/overview`,
  note: (r) => `/projects/${r.projectId}/notes`,
  link: (r) => `/projects/${r.projectId}/links`,
  integration: (r) => `/projects/${r.projectId}/integrations`,
  credential: (r) => `/projects/${r.projectId}/credentials`,
}

export function SearchPalette() {
  const { isOpen, query, results, isLoading, closeSearch, setQuery } = useSearch()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [isOpen])

  const allResults: SearchResult[] = results
    ? [
        ...results.projects,
        ...results.notes,
        ...results.links,
        ...results.integrations,
        ...results.credentials,
      ]
    : []

  const handleSelect = (result: SearchResult) => {
    const pathFn = typePaths[result.type]
    if (pathFn) {
      router.push(pathFn(result))
      closeSearch()
    }
  }

  const grouped = results
    ? Object.entries({
        Projects: results.projects,
        Integrations: results.integrations,
        Notes: results.notes,
        Links: results.links,
        Credentials: results.credentials,
      }).filter(([, items]) => items.length > 0)
    : []

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeSearch}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-xl bg-[#161E2E] border border-white/[0.08] rounded-2xl shadow-modal overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-muted animate-spin shrink-0" />
              ) : (
                <Search className="w-5 h-5 text-muted shrink-0" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, notes, links, integrations..."
                className="flex-1 bg-transparent text-white placeholder:text-muted outline-none text-base"
              />
              <div className="flex items-center gap-2">
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="text-muted hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <kbd className="text-xs text-muted bg-white/5 border border-white/[0.08] rounded px-1.5 py-0.5 font-mono">
                  Esc
                </kbd>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto">
              {!query && (
                <div className="px-4 py-8 text-center">
                  <Search className="w-8 h-8 text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-muted text-sm">Start typing to search across your vault</p>
                </div>
              )}

              {query && !isLoading && allResults.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-muted text-sm">No results for &ldquo;{query}&rdquo;</p>
                </div>
              )}

              {grouped.map(([groupLabel, items]) => (
                <div key={groupLabel} className="py-2">
                  <p className="px-4 py-1 text-xs font-semibold text-muted uppercase tracking-wider">
                    {groupLabel}
                  </p>
                  {items.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors group"
                    >
                      <span className="shrink-0">{typeIcons[result.type]}</span>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm text-white truncate">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-xs text-muted truncate">{result.subtitle}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-muted bg-white/5 rounded px-1.5 py-0.5">
                        {typeLabels[result.type]}
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center gap-4 text-xs text-muted">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>esc close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
