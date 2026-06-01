import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase-server'

async function getUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(request: NextRequest) {
  try {
    const supaUser = await getUser()
    if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = request.nextUrl
    const projectId = searchParams.get('projectId')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where = {
      user_id: supaUser.id,
      ...(projectId ? { entity_type: 'PROJECT', entity_id: projectId } : {}),
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: projectId
          ? { user_id: supaUser.id, entity_id: projectId }
          : { user_id: supaUser.id },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip,
      }),
      prisma.activityLog.count({
        where: projectId
          ? { user_id: supaUser.id, entity_id: projectId }
          : { user_id: supaUser.id },
      }),
    ])

    return NextResponse.json({ logs, total, page, limit })
  } catch (error) {
    console.error('[ACTIVITY]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
