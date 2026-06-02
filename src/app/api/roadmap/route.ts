import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-helper'
import { logActivity } from '@/lib/activity'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.is_guest) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { project_id, title, description, status, priority, target_date } = body

    if (!project_id || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const project = await prisma.project.findFirst({
      where: { id: project_id, user_id: user.id },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found or forbidden' }, { status: 403 })
    }

    const roadmapItem = await prisma.roadmapItem.create({
      data: {
        project_id,
        title,
        description: description || null,
        status: status || 'PLANNED',
        priority: priority || 'MEDIUM',
        target_date: target_date || null,
      },
    })

    await logActivity(user.id, 'ADDED_ROADMAP', 'PROJECT', project_id, title)

    return NextResponse.json({ item: roadmapItem }, { status: 201 })
  } catch (error) {
    console.error('[ROADMAP POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
