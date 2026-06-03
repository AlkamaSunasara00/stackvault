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

  const existing = await prisma.task.findFirst({ where: { id }, include: { project: true } })
  if (!existing || existing.project.user_id !== supaUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const task = await prisma.task.update({
    where: { id },
    data: {
      title: body.title !== undefined ? body.title : existing.title,
      description: body.description !== undefined ? body.description : existing.description,
      status: body.status !== undefined ? body.status : existing.status,
      priority: body.priority !== undefined ? body.priority : existing.priority,
      due_date: body.due_date !== undefined ? (body.due_date ? new Date(body.due_date) : null) : existing.due_date,
    },
  })
  
  await logActivity(supaUser.id, 'UPDATED', 'TASK', id, task.title)
  return NextResponse.json({ task })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supaUser = await getUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await prisma.task.findFirst({ where: { id }, include: { project: true } })
  if (!task || task.project.user_id !== supaUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.task.delete({ where: { id } })
  await logActivity(supaUser.id, 'DELETED', 'TASK', id, task.title)
  return NextResponse.json({ success: true })
}
