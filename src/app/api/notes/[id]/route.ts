import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity'

async function getUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supaUser = await getUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.projectNote.findFirst({ where: { id }, include: { project: true } })
  if (!existing || existing.project.user_id !== supaUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const note = await prisma.projectNote.update({
    where: { id },
    data: {
      title: body.title ?? existing.title,
      content: body.content ?? existing.content,
      tags: body.tags ?? existing.tags,
      is_pinned: body.is_pinned ?? existing.is_pinned,
    },
  })
  await logActivity(supaUser.id, 'UPDATED', 'NOTE', id, note.title)
  return NextResponse.json({ note })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supaUser = await getUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const note = await prisma.projectNote.findFirst({ where: { id }, include: { project: true } })
  if (!note || note.project.user_id !== supaUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.projectNote.delete({ where: { id } })
  await logActivity(supaUser.id, 'DELETED', 'NOTE', id, note.title)
  return NextResponse.json({ success: true })
}
