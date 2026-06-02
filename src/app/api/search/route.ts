import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-helper'

export async function GET(request: NextRequest) {
  try {
    const supaUser = await getAuthUser()
    if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const q = request.nextUrl.searchParams.get('q') || ''
    if (!q.trim()) return NextResponse.json({ projects: [], notes: [], links: [], integrations: [], credentials: [] })

    const userId = supaUser.id

    const [projects, notes, links, integrations, credentials] = await Promise.all([
      prisma.project.findMany({
        where: {
          user_id: userId,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
          is_archived: false,
        },
        select: { id: true, name: true, status: true },
        take: 5,
      }),
      prisma.projectNote.findMany({
        where: {
          project: { user_id: userId },
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, project_id: true },
        take: 5,
      }),
      prisma.projectLink.findMany({
        where: {
          project: { user_id: userId },
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { url: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, url: true, project_id: true },
        take: 5,
      }),
      prisma.projectIntegration.findMany({
        where: {
          project: { user_id: userId },
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, status: true, project_id: true, category: true },
        take: 5,
      }),
      prisma.credential.findMany({
        where: {
          project: { user_id: userId },
          title: { contains: q, mode: 'insensitive' },
        },
        select: { id: true, title: true, type: true, project_id: true },
        take: 5,
      }),
    ])

    return NextResponse.json({
      projects: projects.map((p) => ({ id: p.id, type: 'project', title: p.name, subtitle: p.status })),
      notes: notes.map((n) => ({ id: n.id, type: 'note', title: n.title, projectId: n.project_id })),
      links: links.map((l) => ({ id: l.id, type: 'link', title: l.title, subtitle: l.url, projectId: l.project_id })),
      integrations: integrations.map((i) => ({ id: i.id, type: 'integration', title: i.name, subtitle: `${i.category} • ${i.status}`, projectId: i.project_id })),
      credentials: credentials.map((cr) => ({ id: cr.id, type: 'credential', title: cr.title, subtitle: cr.type, projectId: cr.project_id })),
    })
  } catch (error) {
    console.error('[SEARCH]', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
