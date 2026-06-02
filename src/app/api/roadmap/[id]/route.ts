import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-helper'
import { logActivity } from '@/lib/activity'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.is_guest) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { title, description, status, priority, target_date } = body

    const existing = await prisma.roadmapItem.findUnique({
      where: { id },
      include: { project: true },
    })

    if (!existing || existing.project.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })
    }

    const updated = await prisma.roadmapItem.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(target_date !== undefined && { target_date }),
      },
    })

    await logActivity(user.id, 'UPDATED_ROADMAP', 'PROJECT', existing.project_id, title || existing.title)

    return NextResponse.json({ item: updated })
  } catch (error) {
    console.error('[ROADMAP ITEM PUT]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.is_guest) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const existing = await prisma.roadmapItem.findUnique({
      where: { id },
      include: { project: true },
    })

    if (!existing || existing.project.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })
    }

    await prisma.roadmapItem.delete({ where: { id } })
    await logActivity(user.id, 'DELETED_ROADMAP', 'PROJECT', existing.project_id, existing.title)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ROADMAP ITEM DELETE]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
