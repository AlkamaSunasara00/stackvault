import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: {
            name: string
            value: string
            options: CookieOptions
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const guestSession = request.cookies.get('vault_guest_session')?.value

  const { pathname } = request.nextUrl

  // Block any mutating requests from guest sessions
  if (guestSession && request.method !== 'GET' && !pathname.startsWith('/api/auth')) {
    return new NextResponse(JSON.stringify({ error: 'Guest access is read-only' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Public routes — always allow
  const publicRoutes = ['/login', '/register', '/forgot-password']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const isApiAuthRoute = pathname.startsWith('/api/auth')

  if (isApiAuthRoute || isPublicRoute) {
    // If they have any session and try to go to login/register, redirect to dashboard
    if (isPublicRoute && (session || guestSession)) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
    return supabaseResponse
  }

  // Redirect root to dashboard or login
  if (pathname === '/') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = (session || guestSession) ? '/dashboard' : '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Protected routes — require session or guest session
  if (!session && !guestSession) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
