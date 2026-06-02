import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.guest_password) {
      return NextResponse.json({ error: 'Invalid email or view-only password' }, { status: 401 })
    }

    if (user.guest_password !== password) {
      return NextResponse.json({ error: 'Invalid email or view-only password' }, { status: 401 })
    }

    // Set guest session cookie
    const cookieStore = await cookies()
    cookieStore.set('vault_guest_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        is_guest: true,
      },
    })
  } catch (error) {
    console.error('[GUEST LOGIN]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
