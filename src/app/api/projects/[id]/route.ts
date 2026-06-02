import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity'
import { getAuthUser } from '@/lib/auth-helper'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supaUser = await getAuthUser()
    if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const project = await prisma.project.findFirst({
      where: { id, user_id: supaUser.id },
      include: {
        links: { orderBy: { created_at: 'desc' } },
        notes: { orderBy: [{ is_pinned: 'desc' }, { updated_at: 'desc' }] },
        roadmap: { orderBy: { created_at: 'desc' } },
        environments: {
          include: {
            variables: { orderBy: { key: 'asc' } },
          },
          orderBy: { created_at: 'asc' },
        },
        credentials: { orderBy: { created_at: 'desc' } },
        _count: { select: { links: true, notes: true, roadmap: true, credentials: true } },
      },
    })

    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ project })
  } catch (error) {
    console.error('[PROJECT GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supaUser = await getAuthUser()
    if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (supaUser.is_guest) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const formData = await request.formData()

    const existing = await prisma.project.findFirst({ where: { id, user_id: supaUser.id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const name = formData.get('name') as string || existing.name
    const description = formData.get('description') as string | null
    const client_name = formData.get('client_name') as string | null
    const status = formData.get('status') as string || existing.status
    const is_archived = formData.get('is_archived')
    const tech_stack_raw = formData.get('tech_stack') as string | null
    const tech_stack = tech_stack_raw ? JSON.parse(tech_stack_raw) : existing.tech_stack

    let logo_url = existing.logo_url
    const logoFile = formData.get('logo') as File | null
    if (logoFile && logoFile.size > 0) {
      const supabase = await createSupabaseServerClient()
      const ext = logoFile.name.split('.').pop()
      const fileName = `${supaUser.id}/${id}.${ext}`
      const buffer = await logoFile.arrayBuffer()
      const { error: uploadError } = await supabase.storage
        .from('project-logos')
        .upload(fileName, buffer, { contentType: logoFile.type, upsert: true })
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('project-logos').getPublicUrl(fileName)
        logo_url = publicUrl
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description: description ?? existing.description,
        client_name: client_name ?? existing.client_name,
        status: status as never,
        tech_stack,
        logo_url,
        ...(is_archived !== null && is_archived !== undefined ? { is_archived: is_archived === 'true' } : {}),
      },
    })

    await logActivity(supaUser.id, 'UPDATED', 'PROJECT', project.id, project.name)

    return NextResponse.json({ project })
  } catch (error) {
    console.error('[PROJECT PUT]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supaUser = await getAuthUser()
    if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (supaUser.is_guest) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const project = await prisma.project.findFirst({ where: { id, user_id: supaUser.id } })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.project.delete({ where: { id } })
    await logActivity(supaUser.id, 'DELETED', 'PROJECT', id, project.name)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PROJECT DELETE]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
