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
  const existing = await prisma.deployment.findFirst({ where: { id }, include: { project: true } })
  if (!existing || existing.project.user_id !== supaUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const deployment = await prisma.deployment.update({
    where: { id },
    data: {
      hosting_provider: body.hosting_provider ?? existing.hosting_provider,
      server_ip: body.server_ip ?? existing.server_ip,
      production_url: body.production_url ?? existing.production_url,
      deployed_at: body.deployed_at ? new Date(body.deployed_at) : existing.deployed_at,
      status: body.status ?? existing.status,
      notes: body.notes ?? existing.notes,
    },
  })
  return NextResponse.json({ deployment })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supaUser = await getUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dep = await prisma.deployment.findFirst({ where: { id }, include: { project: true } })
  if (!dep || dep.project.user_id !== supaUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await prisma.deployment.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
