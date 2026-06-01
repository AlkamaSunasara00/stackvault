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
  const { project_id, name } = body
  if (!project_id || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const project = await prisma.project.findFirst({ where: { id: project_id, user_id: supaUser.id } })
  if (!project) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const existing = await prisma.environment.findFirst({ where: { project_id, name } })
  if (existing) return NextResponse.json({ environment: existing })
  const environment = await prisma.environment.create({ data: { project_id, name }, include: { variables: true } })
  return NextResponse.json({ environment }, { status: 201 })
}
