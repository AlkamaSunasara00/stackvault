import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('vault_guest_session')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[GUEST LOGOUT]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
