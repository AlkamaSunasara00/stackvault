'use client'

import React, { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileDrawer } from '@/components/layout/MobileDrawer'
import { ProjectTabs } from '@/components/layout/ProjectTabs'
import { useSidebar } from '@/context/SidebarContext'
import { clsx } from 'clsx'

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <Header onMenuClick={() => setDrawerOpen(true)} />

      <div className={clsx(
        "pt-16 transition-all duration-300",
        collapsed ? "lg:ml-16" : "lg:ml-60"
      )}>
        {/* Tab bar */}
        <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-16 z-10">
          <ProjectTabs />
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
