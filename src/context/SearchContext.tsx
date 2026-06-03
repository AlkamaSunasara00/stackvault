'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { SearchResults } from '@/types'
import axios from 'axios'

interface SearchContextType {
  isOpen: boolean
  query: string
  results: SearchResults | null
  isLoading: boolean
  openSearch: () => void
  closeSearch: () => void
  setQuery: (q: string) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

const EMPTY_RESULTS: SearchResults = {
  projects: [],
  notes: [],
  links: [],
  tasks: [],
  credentials: [],
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQueryState] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openSearch = useCallback(() => setIsOpen(true), [])
  const closeSearch = useCallback(() => {
    setIsOpen(false)
    setQueryState('')
    setResults(null)
  }, [])

  const setQuery = useCallback((q: string) => {
    setQueryState(q)
  }, [])

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    if (!query.trim()) {
      setResults(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    debounceTimer.current = setTimeout(async () => {
      try {
        const { data } = await axios.get<SearchResults>(`/api/search?q=${encodeURIComponent(query)}`)
        setResults(data)
      } catch {
        setResults(EMPTY_RESULTS)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [query])

  // Global Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && isOpen) {
        closeSearch()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeSearch])

  return (
    <SearchContext.Provider
      value={{ isOpen, query, results, isLoading, openSearch, closeSearch, setQuery }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) throw new Error('useSearch must be used within SearchProvider')
  return context
}
