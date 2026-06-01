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

export async function POST(request: NextRequest) {
  const supaUser = await getUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { project_id, title, type, username, password, description } = body

  if (!project_id || !title || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const project = await prisma.project.findFirst({ where: { id: project_id, user_id: supaUser.id } })
  if (!project) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const encryptedPassword = encrypt(password)

  const credential = await prisma.credential.create({
    data: { project_id, title, type: type || 'DATABASE', username: username || null, password: encryptedPassword, description: description || null },
  })

  await logActivity(supaUser.id, 'CREATED', 'CREDENTIAL', credential.id, title)

  // Return without exposing encrypted password
  return NextResponse.json({ credential: { ...credential, password: '●'.repeat(12) } }, { status: 201 })
}

export async function GET(request: NextRequest) {
  const supaUser = await getUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const projectId = request.nextUrl.searchParams.get('project_id')
  const where = projectId ? { project_id: projectId } : { project: { user_id: supaUser.id } }
  const credentials = await prisma.credential.findMany({
    where,
    orderBy: { created_at: 'desc' },
    select: { id: true, title: true, type: true, username: true, description: true, created_at: true, project_id: true, password: false },
  })
  return NextResponse.json({ credentials })
}
