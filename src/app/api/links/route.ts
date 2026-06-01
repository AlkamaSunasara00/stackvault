import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity'

async function getUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function verifyProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, user_id: userId } })
  return !!project
}

export async function GET(request: NextRequest) {
  const supaUser = await getUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const projectId = request.nextUrl.searchParams.get('project_id')
  const where = projectId ? { project_id: projectId } : { project: { user_id: supaUser.id } }
  const links = await prisma.projectLink.findMany({ where, orderBy: { created_at: 'desc' } })
  return NextResponse.json({ links })
}

export async function POST(request: NextRequest) {
  const supaUser = await getUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { project_id, title, url, category, description } = body
  if (!project_id || !title || !url) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const owned = await verifyProjectOwnership(project_id, supaUser.id)
  if (!owned) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const link = await prisma.projectLink.create({ data: { project_id, title, url, category: category || 'OTHER', description } })
  await logActivity(supaUser.id, 'CREATED', 'LINK', link.id, title)
  return NextResponse.json({ link }, { status: 201 })
}
