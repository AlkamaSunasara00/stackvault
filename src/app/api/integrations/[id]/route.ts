import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-helper'
import { logActivity } from '@/lib/activity'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supaUser = await getAuthUser()
    if (!supaUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (supaUser.is_guest) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, category, status, url, api_doc_url, description } = body

    // Verify integration belongs to user's project
    const existing = await prisma.projectIntegration.findFirst({
      where: {
        id,
        project: { user_id: supaUser.id },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    const integration = await prisma.projectIntegration.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(status && { status }),
        ...(url !== undefined && { url: url || null }),
        ...(api_doc_url !== undefined && { api_doc_url: api_doc_url || null }),
        ...(description !== undefined && { description: description || null }),
      },
    })

    await logActivity(
      supaUser.id,
      'UPDATED_INTEGRATION',
      'PROJECT',
      existing.project_id,
      integration.name
    )

    return NextResponse.json({ integration })
  } catch (error) {
    console.error('[INTEGRATION PUT]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supaUser = await getAuthUser()
    if (!supaUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (supaUser.is_guest) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify integration belongs to user's project
    const existing = await prisma.projectIntegration.findFirst({
      where: {
        id,
        project: { user_id: supaUser.id },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    await prisma.projectIntegration.delete({
      where: { id },
    })

    await logActivity(
      supaUser.id,
      'DELETED_INTEGRATION',
      'PROJECT',
      existing.project_id,
      existing.name
    )

    return NextResponse.json({ message: 'Integration deleted successfully' })
  } catch (error) {
    console.error('[INTEGRATION DELETE]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
