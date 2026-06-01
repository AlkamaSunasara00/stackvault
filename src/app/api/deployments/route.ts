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
  const { project_id, hosting_provider, server_ip, production_url, deployed_at, status, notes } = body
  if (!project_id || !hosting_provider || !deployed_at || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const project = await prisma.project.findFirst({ where: { id: project_id, user_id: supaUser.id } })
  if (!project) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const deployment = await prisma.deployment.create({
    data: { project_id, hosting_provider, server_ip: server_ip || null, production_url: production_url || null, deployed_at: new Date(deployed_at), status, notes: notes || null },
  })
  await logActivity(supaUser.id, 'CREATED', 'DEPLOYMENT', deployment.id, `${hosting_provider} deployment`)
  return NextResponse.json({ deployment }, { status: 201 })
}
