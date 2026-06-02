import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-helper'

export async function GET() {
  const supaUser = await getAuthUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const favorites = await prisma.favorite.findMany({
    where: { user_id: supaUser.id },
    include: {
      project: {
        include: { _count: { select: { links: true, notes: true, roadmap: true, credentials: true } } },
      },
    },
    orderBy: { created_at: 'desc' },
  })
  return NextResponse.json({ favorites })
}

export async function POST(request: NextRequest) {
  const supaUser = await getAuthUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (supaUser.is_guest) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { projectId } = await request.json()
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const existing = await prisma.favorite.findFirst({ where: { user_id: supaUser.id, project_id: projectId } })

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    return NextResponse.json({ favorited: false })
  }

  await prisma.favorite.create({ data: { user_id: supaUser.id, project_id: projectId } })
  return NextResponse.json({ favorited: true })
}
