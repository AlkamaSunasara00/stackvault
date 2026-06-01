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
  const existing = await prisma.projectCommand.findFirst({ where: { id }, include: { project: true } })
  if (!existing || existing.project.user_id !== supaUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const command = await prisma.projectCommand.update({
    where: { id },
    data: { title: body.title ?? existing.title, command: body.command ?? existing.command, category: body.category ?? existing.category, description: body.description ?? existing.description },
  })
  await logActivity(supaUser.id, 'UPDATED', 'COMMAND', id, command.title)
  return NextResponse.json({ command })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supaUser = await getUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const cmd = await prisma.projectCommand.findFirst({ where: { id }, include: { project: true } })
  if (!cmd || cmd.project.user_id !== supaUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await prisma.projectCommand.delete({ where: { id } })
  await logActivity(supaUser.id, 'DELETED', 'COMMAND', id, cmd.title)
  return NextResponse.json({ success: true })
}
