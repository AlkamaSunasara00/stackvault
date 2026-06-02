import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity'
import { getAuthUser } from '@/lib/auth-helper'

export async function GET(request: NextRequest) {
  try {
    const supaUser = await getAuthUser()
    if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status')
    const archived = searchParams.get('archived')
    const sort = searchParams.get('sort') || 'updatedAt'

    const orderBy: Record<string, 'asc' | 'desc'> = {}
    if (sort === 'name') orderBy.name = 'asc'
    else if (sort === 'createdAt') orderBy.created_at = 'desc'
    else orderBy.updated_at = 'desc'

    const projects = await prisma.project.findMany({
      where: {
        user_id: supaUser.id,
        ...(status && status !== 'all' ? { status: status as never } : {}),
        is_archived: archived === 'true',
      },
      include: {
        _count: {
          select: { links: true, notes: true, roadmap: true, credentials: true },
        },
        favorites: { where: { user_id: supaUser.id } },
      },
      orderBy,
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('[PROJECTS GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supaUser = await getAuthUser()
    if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (supaUser.is_guest) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const formData = await request.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const client_name = formData.get('client_name') as string | null
    const status = formData.get('status') as string
    const tech_stack_raw = formData.get('tech_stack') as string | null
    const tech_stack = tech_stack_raw ? JSON.parse(tech_stack_raw) : []

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    // Handle logo upload
    let logo_url: string | null = null
    const logoFile = formData.get('logo') as File | null
    if (logoFile && logoFile.size > 0) {
      const supabase = await createSupabaseServerClient()
      const ext = logoFile.name.split('.').pop()
      const fileName = `${supaUser.id}/${Date.now()}.${ext}`
      const buffer = await logoFile.arrayBuffer()
      const { error: uploadError } = await supabase.storage
        .from('project-logos')
        .upload(fileName, buffer, { contentType: logoFile.type, upsert: true })
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('project-logos').getPublicUrl(fileName)
        logo_url = publicUrl
      }
    }

    const project = await prisma.project.create({
      data: {
        user_id: supaUser.id,
        name,
        description: description || null,
        client_name: client_name || null,
        status: status as never,
        tech_stack,
        logo_url,
      },
      include: { _count: { select: { links: true, notes: true, roadmap: true, credentials: true } } },
    })

    await logActivity(supaUser.id, 'CREATED', 'PROJECT', project.id, project.name)

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('[PROJECTS POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
