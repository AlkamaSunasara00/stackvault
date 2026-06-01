'use client'

import React, { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileDrawer } from '@/components/layout/MobileDrawer'
import { ProjectTabs } from '@/components/layout/ProjectTabs'

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <Header onMenuClick={() => setDrawerOpen(true)} />

      <div className="lg:ml-60 pt-16 transition-all duration-300">
        {/* Tab bar */}
        <div className="border-b border-white/[0.06] bg-background/80 backdrop-blur-sm sticky top-16 z-10">
          <ProjectTabs />
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
