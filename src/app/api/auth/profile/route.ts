import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-helper'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const fullUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!fullUser) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      user: {
        ...fullUser,
        is_guest: user.is_guest || false,
      }
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.is_guest) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.avatar_url !== undefined && { avatar_url: body.avatar_url }),
        ...(body.guest_password !== undefined && { guest_password: body.guest_password || null }),
      },
    })
    return NextResponse.json({ user: updated })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
