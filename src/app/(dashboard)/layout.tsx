'use client'

import React, { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileDrawer } from '@/components/layout/MobileDrawer'

export default function DashboardLayout({
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
      <main className="lg:ml-60 pt-16 transition-all duration-300">
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
