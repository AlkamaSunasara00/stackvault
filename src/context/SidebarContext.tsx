'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface SidebarContextType {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  // Sync collapsed state from localStorage on load
  useEffect(() => {
    const stored = localStorage.getItem('stackvault_sidebar_collapsed')
    if (stored) {
      setCollapsed(stored === 'true')
    }
  }, [])

  const handleSetCollapsed = (val: boolean) => {
    setCollapsed(val)
    localStorage.setItem('stackvault_sidebar_collapsed', String(val))
  }

  const toggleCollapsed = () => {
    handleSetCollapsed(!collapsed)
  }

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed: handleSetCollapsed,
        toggleCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
