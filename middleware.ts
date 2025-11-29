import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Auth Check: If no user and trying to access dashboard, redirect to login
  if (!user && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 2. Auth Check: If user exists and trying to access login/register, redirect to dashboard
  if (user && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register-hospital')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // 3. RBAC Check: If user is in dashboard, check role permissions
  if (user && req.nextUrl.pathname.startsWith('/dashboard')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile) {
      const role = profile.role
      const path = req.nextUrl.pathname

      // Owner has full access to everything
      if (role === 'owner') {
        return res
      }

      // Define allowed paths for other roles
      const allowedPaths: Record<string, string[]> = {
        doctor: ['/dashboard/doctor'],
        nurse: ['/dashboard/nurse'],
        receptionist: ['/dashboard/reception', '/dashboard/appointments', '/dashboard/billing'],
      }

      const userAllowedPaths = allowedPaths[role] || []

      // Check if the current path is allowed
      // We allow exact match of allowed paths or sub-paths
      const isAllowed = userAllowedPaths.some(allowedPath => path.startsWith(allowedPath))

      // Special handling for the root /dashboard path
      // If they are at /dashboard, we redirect them to their main home to be helpful (and consistent with page.tsx)
      if (path === '/dashboard') {
        if (role === 'doctor') return NextResponse.redirect(new URL('/dashboard/doctor', req.url))
        if (role === 'nurse') return NextResponse.redirect(new URL('/dashboard/nurse', req.url))
        if (role === 'receptionist') return NextResponse.redirect(new URL('/dashboard/reception', req.url))
      }

      // If they are trying to access a specific path but it's not in their allowed list
      if (path !== '/dashboard' && !isAllowed) {
        // Redirect to their specific home page
        if (role === 'doctor') return NextResponse.redirect(new URL('/dashboard/doctor', req.url))
        if (role === 'nurse') return NextResponse.redirect(new URL('/dashboard/nurse', req.url))
        if (role === 'receptionist') return NextResponse.redirect(new URL('/dashboard/reception', req.url))

        // Fallback for unknown roles (shouldn't happen if roles are consistent)
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register-hospital'],
}
