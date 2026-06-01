'use client'

import { useSearch as useSearchContext } from '@/context/SearchContext'

export function useSearch() {
  return useSearchContext()
}
