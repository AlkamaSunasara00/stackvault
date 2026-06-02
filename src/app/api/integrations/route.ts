import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-helper'
import { logActivity } from '@/lib/activity'

export async function GET(request: NextRequest) {
  try {
    const supaUser = await getAuthUser()
    if (!supaUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, user_id: supaUser.id },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const integrations = await prisma.projectIntegration.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json({ integrations })
  } catch (error) {
    console.error('[INTEGRATIONS GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supaUser = await getAuthUser()
    if (!supaUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (supaUser.is_guest) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { project_id, name, category, status, url, api_doc_url, description } = body

    if (!project_id || !name || !category) {
      return NextResponse.json({ error: 'Project ID, name, and category are required' }, { status: 400 })
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: project_id, user_id: supaUser.id },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const integration = await prisma.projectIntegration.create({
      data: {
        project_id,
        name,
        category,
        status: status || 'ACTIVE',
        url: url || null,
        api_doc_url: api_doc_url || null,
        description: description || null,
      },
    })

    await logActivity(supaUser.id, 'ADDED_INTEGRATION', 'PROJECT', project_id, name)

    return NextResponse.json({ integration }, { status: 201 })
  } catch (error) {
    console.error('[INTEGRATIONS POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
