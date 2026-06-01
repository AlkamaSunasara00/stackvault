import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity'

async function getUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function POST(request: NextRequest) {
  const supaUser = await getUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { project_id, title, content, tags, is_pinned } = body
  if (!project_id || !title) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const project = await prisma.project.findFirst({ where: { id: project_id, user_id: supaUser.id } })
  if (!project) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const note = await prisma.projectNote.create({
    data: { project_id, title, content: content || '', tags: tags || [], is_pinned: is_pinned || false },
  })
  await logActivity(supaUser.id, 'CREATED', 'NOTE', note.id, title)
  return NextResponse.json({ note }, { status: 201 })
}
