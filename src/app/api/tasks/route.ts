import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { logActivity } from '@/lib/activity'
import { getAuthUser } from '@/lib/auth-helper'

export async function POST(request: NextRequest) {
  const supaUser = await getAuthUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { project_id, title, description, status, priority, due_date } = body
  if (!project_id || !title) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const project = await prisma.project.findFirst({ where: { id: project_id, user_id: supaUser.id } })
  if (!project) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  
  const task = await prisma.task.create({
    data: {
      project_id,
      title,
      description: description || null,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      due_date: due_date ? new Date(due_date) : null,
    },
  })
  
  await logActivity(supaUser.id, 'CREATED', 'TASK', task.id, title)
  return NextResponse.json({ task }, { status: 201 })
}
