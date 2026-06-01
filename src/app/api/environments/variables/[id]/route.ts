import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase-server'

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

  const existing = await prisma.environmentVariable.findFirst({
    where: { id },
    include: { environment: { include: { project: true } } },
  })
  if (!existing || existing.environment.project.user_id !== supaUser.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const variable = await prisma.environmentVariable.update({
    where: { id },
    data: {
      key: body.key ?? existing.key,
      value: body.value ?? existing.value,
      description: body.description ?? existing.description,
      is_secret: body.is_secret ?? existing.is_secret,
    },
  })
  return NextResponse.json({ variable })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supaUser = await getUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const variable = await prisma.environmentVariable.findFirst({
    where: { id },
    include: { environment: { include: { project: true } } },
  })
  if (!variable || variable.environment.project.user_id !== supaUser.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.environmentVariable.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
