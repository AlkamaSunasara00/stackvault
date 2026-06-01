import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, email, name, avatar_url } = body

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await prisma.user.upsert({
      where: { id },
      update: { name, email, avatar_url },
      create: { id, name: name || email.split('@')[0], email, avatar_url },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[AUTH SYNC]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user: supaUser } } = await supabase.auth.getUser()

    if (!supaUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: supaUser.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('[AUTH PROFILE]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user: supaUser } } = await supabase.auth.getUser()

    if (!supaUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, avatar_url } = body

    const user = await prisma.user.update({
      where: { id: supaUser.id },
      data: { ...(name && { name }), ...(avatar_url && { avatar_url }) },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('[AUTH UPDATE]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
