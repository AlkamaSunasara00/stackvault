import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { encrypt, decrypt } from '@/lib/encrypt'
import { logActivity } from '@/lib/activity'

async function getUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supaUser = await getUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const reveal = request.nextUrl.searchParams.get('reveal') === 'true'

  const credential = await prisma.credential.findFirst({
    where: { id },
    include: { project: true },
  })
  if (!credential || credential.project.user_id !== supaUser.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (reveal) {
    try {
      const plainPassword = decrypt(credential.password)
      return NextResponse.json({ password: plainPassword })
    } catch {
      return NextResponse.json({ error: 'Decryption failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ credential: { ...credential, password: '●'.repeat(12) } })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supaUser = await getUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.credential.findFirst({ where: { id }, include: { project: true } })
  if (!existing || existing.project.user_id !== supaUser.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const passwordToStore = body.password ? encrypt(body.password) : existing.password

  const credential = await prisma.credential.update({
    where: { id },
    data: {
      title: body.title ?? existing.title,
      type: body.type ?? existing.type,
      username: body.username ?? existing.username,
      password: passwordToStore,
      description: body.description ?? existing.description,
    },
  })
  await logActivity(supaUser.id, 'UPDATED', 'CREDENTIAL', id, credential.title)
  return NextResponse.json({ credential: { ...credential, password: '●'.repeat(12) } })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supaUser = await getUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const credential = await prisma.credential.findFirst({ where: { id }, include: { project: true } })
  if (!credential || credential.project.user_id !== supaUser.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.credential.delete({ where: { id } })
  await logActivity(supaUser.id, 'DELETED', 'CREDENTIAL', id, credential.title)
  return NextResponse.json({ success: true })
}
