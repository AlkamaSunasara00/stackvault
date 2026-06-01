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

  const link = await prisma.projectLink.findFirst({
    where: { id },
    include: { project: true },
  })
  if (!link || link.project.user_id !== supaUser.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const updated = await prisma.projectLink.update({
    where: { id },
    data: { title: body.title, url: body.url, category: body.category, description: body.description },
  })
  await logActivity(supaUser.id, 'UPDATED', 'LINK', id, updated.title)
  return NextResponse.json({ link: updated })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supaUser = await getUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const link = await prisma.projectLink.findFirst({
    where: { id },
    include: { project: true },
  })
  if (!link || link.project.user_id !== supaUser.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.projectLink.delete({ where: { id } })
  await logActivity(supaUser.id, 'DELETED', 'LINK', id, link.title)
  return NextResponse.json({ success: true })
}
