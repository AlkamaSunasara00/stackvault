import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase-server'

async function getUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function POST(request: NextRequest) {
  const supaUser = await getUser()
  if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { environment_id, key, value, description, is_secret } = body
  if (!environment_id || !key || value === undefined) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Verify ownership via environment -> project
  const env = await prisma.environment.findFirst({ where: { id: environment_id }, include: { project: true } })
  if (!env || env.project.user_id !== supaUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const variable = await prisma.environmentVariable.create({
    data: { environment_id, key, value, description: description || null, is_secret: is_secret || false },
  })
  return NextResponse.json({ variable }, { status: 201 })
}
