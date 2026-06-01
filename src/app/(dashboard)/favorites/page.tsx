'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Favorite } from '@/types'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { Star } from 'lucide-react'

async function fetchFavorites() {
  const { data } = await axios.get<{ favorites: Favorite[] }>('/api/favorites')
  return data.favorites
}

export default function FavoritesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
  })

  const projects = (favorites ?? []).map((f) => f.project!).filter(Boolean)
  const favoriteIds = new Set(projects.map((p) => p.id))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
          <Star className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Favorites</h2>
          <p className="text-muted text-sm">{projects.length} starred project{projects.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <ProjectGrid
        projects={projects}
        favoritedIds={favoriteIds}
        isLoading={isLoading}
        emptyMessage="No favorite projects yet"
        onCreateClick={() => setCreateOpen(true)}
      />

      <CreateProjectModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
